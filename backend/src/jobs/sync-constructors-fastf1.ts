import axios from 'axios';
import { logger } from '../utils/logger';

const ML_SERVICE_URL = process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:8000';

export async function syncConstructorsFromFastF1(
  seasons?: number[],
  season?: number
): Promise<void> {
  try {
    logger.info(`Starting constructor sync from FastF1 ML service - season: ${season}, seasons: ${seasons}`);

    const requestBody: {
      seasons?: number[];
      season?: number;
    } = {};
    
    if (season !== undefined) {
      requestBody.season = season;
    } else if (seasons !== undefined) {
      requestBody.seasons = seasons;
    }

    const response = await axios.post(
      `${ML_SERVICE_URL}/api/sync/teams`,
      requestBody,
      {
        timeout: 300000, // 5 minutes timeout for sync
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      logger.info(`Successfully synced ${response.data.teams_synced} constructors`);
      if (response.data.errors && response.data.errors.length > 0) {
        logger.warn(`Sync completed with ${response.data.errors.length} errors`);
        response.data.errors.forEach((error: string) => {
          logger.warn(`Sync error: ${error}`);
        });
      }
    } else {
      logger.error(`Constructor sync failed: ${response.data.message}`);
      throw new Error(response.data.message);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`HTTP error during constructor sync: ${error.message}`);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      logger.error(`Error during constructor sync: ${error}`);
    }
    throw error;
  }
}
