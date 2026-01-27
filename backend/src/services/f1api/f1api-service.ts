import { F1ApiClient } from './f1api-client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';
import { F1ApiDriver, F1ApiTeam } from './types';

export class F1ApiService {
  private client: F1ApiClient;

  constructor() {
    this.client = new F1ApiClient();
  }

  async fetchAndSyncDrivers(season: number): Promise<void> {
    try {
      logger.info(`[F1 API] Fetching drivers for season ${season}`);
      
      let drivers: F1ApiDriver[];
      if (season === new Date().getFullYear()) {
        drivers = await this.client.getCurrentDrivers();
      } else {
        drivers = await this.client.getDriversByYear(season);
      }

      if (!drivers || drivers.length === 0) {
        logger.warn(`[F1 API] No drivers found for season ${season}`);
        return;
      }

      for (const driverData of drivers) {
        await this.syncDriver(driverData, season);
      }

      logger.info(`[F1 API] Synced ${drivers.length} drivers for season ${season}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[F1 API] Error fetching drivers for season ${season}`, { error: errorMessage });
      throw error;
    }
  }

  async fetchAndSyncConstructors(season: number): Promise<void> {
    try {
      logger.info(`[F1 API] Fetching constructors for season ${season}`);
      
      let teams: F1ApiTeam[];
      if (season === new Date().getFullYear()) {
        teams = await this.client.getCurrentTeams();
      } else {
        teams = await this.client.getTeamsByYear(season);
      }

      if (!teams || teams.length === 0) {
        logger.warn(`[F1 API] No teams found for season ${season}`);
        return;
      }

      for (const teamData of teams) {
        await this.syncConstructor(teamData);
      }

      logger.info(`[F1 API] Synced ${teams.length} constructors for season ${season}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[F1 API] Error fetching constructors for season ${season}`, { error: errorMessage });
      throw error;
    }
  }

  private async syncDriver(driverData: F1ApiDriver, season: number): Promise<void> {
    // Parse birthday - F1 API has inconsistent formats
    let dateOfBirth: Date | null = null;
    try {
      // Try different date formats
      const dateStr = driverData.birthday;
      if (dateStr.includes('/')) {
        // Format: "13/11/1999"
        const [day, month, year] = dateStr.split('/');
        dateOfBirth = new Date(`${year}-${month}-${day}`);
      } else {
        // Format: "1997-09-30"
        dateOfBirth = new Date(dateStr);
      }
      if (isNaN(dateOfBirth.getTime())) {
        dateOfBirth = null;
      }
    } catch {
      dateOfBirth = null;
    }

    // Map teamId to constructor name (normalize team names)
    const teamName = this.normalizeTeamName(driverData.teamId);

    await prisma.driver.upsert({
      where: { driverId: driverData.driverId },
      update: {
        code: driverData.shortName || null,
        forename: driverData.name,
        surname: driverData.surname,
        dateOfBirth: dateOfBirth,
        nationality: driverData.nationality,
        url: driverData.url || null,
        permanentNumber: driverData.number || null,
        currentTeam: teamName,
        isActive: season === new Date().getFullYear(),
      },
      create: {
        driverId: driverData.driverId,
        code: driverData.shortName || null,
        forename: driverData.name,
        surname: driverData.surname,
        dateOfBirth: dateOfBirth,
        nationality: driverData.nationality,
        url: driverData.url || null,
        permanentNumber: driverData.number || null,
        currentTeam: teamName,
        isActive: season === new Date().getFullYear(),
      },
    });
  }

  private async syncConstructor(teamData: F1ApiTeam): Promise<void> {
    // Map teamId to constructorId format (normalize)
    const constructorId = this.normalizeConstructorId(teamData.teamId);

    await prisma.constructor.upsert({
      where: { constructorId },
      update: {
        name: teamData.teamName,
        nationality: teamData.teamNationality,
        url: teamData.url || null,
      },
      create: {
        constructorId,
        name: teamData.teamName,
        nationality: teamData.teamNationality,
        url: teamData.url || null,
      },
    });
  }

  private normalizeTeamName(teamId: string): string {
    // Map F1 API team IDs to standard team names
    const teamMap: Record<string, string> = {
      'mclaren': 'McLaren',
      'mercedes': 'Mercedes',
      'red_bull': 'Red Bull',
      'ferrari': 'Ferrari',
      'williams': 'Williams',
      'rb': 'Racing Bulls',
      'aston_martin': 'Aston Martin',
      'haas': 'Haas F1 Team',
      'sauber': 'Sauber',
      'alpine': 'Alpine',
    };
    return teamMap[teamId] || teamId;
  }

  private normalizeConstructorId(teamId: string): string {
    // Map F1 API team IDs to constructor IDs used in database
    const constructorMap: Record<string, string> = {
      'mclaren': 'mclaren',
      'mercedes': 'mercedes',
      'red_bull': 'red_bull',
      'ferrari': 'ferrari',
      'williams': 'williams',
      'rb': 'racing_bulls',
      'aston_martin': 'aston_martin',
      'haas': 'haas',
      'sauber': 'sauber',
      'alpine': 'alpine',
    };
    return constructorMap[teamId] || teamId;
  }
}
