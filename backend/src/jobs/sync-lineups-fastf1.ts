import axios from 'axios';
import { logger } from '../utils/logger';

const ML_SERVICE_URL = process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:8000';

export async function syncLineupsFromFastF1(season: number): Promise<void> {
  try {
    logger.info(`Starting lineup sync from FastF1 ML service for season ${season}`);

    const response = await axios.post(
      `${ML_SERVICE_URL}/api/sync/lineups`,
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
    } else {
      logger.error(`Lineup sync failed: ${response.data.message}`);
      throw new Error(response.data.message);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(`HTTP error during lineup sync: ${error.message}`);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      logger.error(`Error during lineup sync: ${error}`);
    }
    throw error;
  }
}
