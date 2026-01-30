import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';

const ML_SERVICE_URL = process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:8000';

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [15000, 30000, 60000]; // 15s, 30s, 60s (cold start on Render free tier)

function isRetryableStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncLineupsFromFastF1(season: number): Promise<void> {
  const url = `${ML_SERVICE_URL}/api/sync/lineups`;
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = RETRY_DELAYS_MS[attempt - 1] ?? 60000;
        logger.info(`Retrying lineup sync in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
        await sleep(delay);
      } else {
        logger.info(`Starting lineup sync from FastF1 ML service for season ${season}`);
      }

      const response = await axios.post(
        url,
        { season },
        {
          timeout: 300000, // 5 minutes timeout for sync
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        logger.info(
          `Successfully synced ${response.data.drivers_synced} driver lineups and ${response.data.constructors_synced} constructor lineups`
        );
        if (response.data.errors && response.data.errors.length > 0) {
          logger.warn(`Sync completed with ${response.data.errors.length} errors`);
          response.data.errors.forEach((error: string) => {
            logger.warn(`Sync error: ${error}`);
          });
        }
        return;
      }

      logger.error(`Lineup sync failed: ${response.data.message}`);
      throw new Error(response.data.message);
    } catch (error) {
      lastError = error;

      if (axios.isAxiosError(error)) {
        const status = (error as AxiosError).response?.status;
        const isRetryable = status !== undefined && isRetryableStatus(status) && attempt < MAX_RETRIES;

        if (status === 502) {
          logger.error(
            `Lineup sync 502 Bad Gateway. Ensure PYTHON_ML_SERVICE_URL points to the ML service (e.g. https://f1-insight-ml-service.onrender.com), not the backend.`
          );
          if (isRetryable) {
            logger.warn(`ML service may be cold (Render free tier). Will retry.`);
          }
        }

        if (!isRetryable) {
          logger.error(`HTTP error during lineup sync: ${error.message}`);
          if (error.response) {
            logger.error(`Response status: ${error.response.status}`);
            const data = error.response.data;
            if (typeof data === 'string' && data.startsWith('<!')) {
              logger.error(`Response body: HTML (e.g. 502 page)`);
            } else {
              logger.error(`Response data: ${JSON.stringify(data)}`);
            }
          }
          throw error;
        }
      } else {
        logger.error(`Error during lineup sync: ${error}`);
        throw error;
      }
    }
  }

  throw lastError;
}
