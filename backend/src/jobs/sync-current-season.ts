import { UnifiedSyncService } from '../services/sync/unified-sync-service';
import { ErgastService } from '../services/ergast/ergast-service';
import { logger } from '../utils/logger';

export async function syncCurrentSeason(): Promise<void> {
  const syncService = new UnifiedSyncService();
  const currentYear = new Date().getFullYear();

  try {
    logger.info(`Starting sync for current season (${currentYear})`);

    // Sync circuits (one-time, but safe to run multiple times)
    await syncService.fetchAndSyncCircuits();

    // Sync current season schedule
    await syncService.fetchAndSyncRaces(currentYear);

    // Sync current season drivers and constructors (with fallback to multiple sources)
    await syncService.fetchAndSyncDrivers(currentYear);
    await syncService.fetchAndSyncConstructors(currentYear);

    logger.info(`Completed sync for current season (${currentYear})`);
  } catch (error) {
    logger.error('Error syncing current season', error);
    // Don't throw - allow server to start even if sync fails
  }
}

export async function syncRaceResults(season: number, round: number): Promise<void> {
  const ergastService = new ErgastService();

  try {
    logger.info(`Syncing race results for ${season} round ${round}`);
    await ergastService.fetchAndSyncRaceResults(season, round);
    await ergastService.fetchAndSyncQualifyingResults(season, round);
    logger.info(`Completed sync for ${season} round ${round}`);
  } catch (error) {
    logger.error(`Error syncing race results for ${season} round ${round}`, error);
    throw error;
  }
}