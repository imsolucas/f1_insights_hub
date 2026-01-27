import { ErgastService } from '../ergast/ergast-service';
import { F1ApiService } from '../f1api/f1api-service';
import { logger } from '../../utils/logger';

export class UnifiedSyncService {
  private ergastService: ErgastService;
  private f1ApiService: F1ApiService;

  constructor() {
    this.ergastService = new ErgastService();
    this.f1ApiService = new F1ApiService();
  }

  async fetchAndSyncDrivers(season: number): Promise<void> {
    const sources = [
      { name: 'F1 API', service: this.f1ApiService, method: 'fetchAndSyncDrivers' },
      { name: 'Ergast API', service: this.ergastService, method: 'fetchAndSyncDrivers' },
    ];

    let lastError: Error | null = null;

    for (const source of sources) {
      try {
        logger.info(`[Unified Sync] Attempting to sync drivers from ${source.name} for season ${season}`);
        await (source.service as any)[source.method](season);
        logger.info(`[Unified Sync] Successfully synced drivers from ${source.name} for season ${season}`);
        return;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`[Unified Sync] Failed to sync drivers from ${source.name}: ${errorMessage}`);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    if (lastError) {
      logger.error(`[Unified Sync] All data sources failed for drivers sync. Last error: ${lastError.message}`);
      throw new Error(`Failed to sync drivers from all data sources: ${lastError.message}`);
    }
  }

  async fetchAndSyncConstructors(season: number): Promise<void> {
    const sources = [
      { name: 'F1 API', service: this.f1ApiService, method: 'fetchAndSyncConstructors' },
      { name: 'Ergast API', service: this.ergastService, method: 'fetchAndSyncConstructors' },
    ];

    let lastError: Error | null = null;

    for (const source of sources) {
      try {
        logger.info(`[Unified Sync] Attempting to sync constructors from ${source.name} for season ${season}`);
        await (source.service as any)[source.method](season);
        logger.info(`[Unified Sync] Successfully synced constructors from ${source.name} for season ${season}`);
        return;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`[Unified Sync] Failed to sync constructors from ${source.name}: ${errorMessage}`);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    if (lastError) {
      logger.error(`[Unified Sync] All data sources failed for constructors sync. Last error: ${lastError.message}`);
      throw new Error(`Failed to sync constructors from all data sources: ${lastError.message}`);
    }
  }

  async fetchAndSyncRaces(season: number): Promise<void> {
    // Races are primarily from Ergast (more historical data)
    try {
      await this.ergastService.fetchAndSyncRaces(season);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[Unified Sync] Failed to sync races: ${errorMessage}`);
      throw error;
    }
  }

  async fetchAndSyncCircuits(): Promise<void> {
    // Circuits are primarily from Ergast
    try {
      await this.ergastService.fetchAndSyncCircuits();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[Unified Sync] Failed to sync circuits: ${errorMessage}`);
      throw error;
    }
  }
}
