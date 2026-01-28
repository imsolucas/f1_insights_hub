import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

interface DriverLineupData {
  driverId: string;
  driverNumber: number | null;
}

interface TeamLineupData {
  teamName: string;
  drivers: DriverLineupData[];
}

interface DriverLineupJson {
  teams: TeamLineupData[];
}

export const lineupRepo = {
  /**
   * Get driver lineup for a season
   * Returns the JSON lineup data and maps it to include driver details
   */
  async getDriverLineup(season: number) {
    const lineupRecord = await prisma.driverSeasonLineup.findUnique({
      where: { season },
    });

    if (!lineupRecord || !lineupRecord.lineup) {
      return [];
    }

    const lineupData = lineupRecord.lineup as unknown as DriverLineupJson;
    
    // Collect all driver IDs from the lineup
    const driverIds = new Set<string>();
    const driverTeamMap = new Map<string, { teamName: string; driverNumber: number | null }>();
    
    for (const team of lineupData.teams) {
      for (const driverData of team.drivers) {
        const normalizedId = driverData.driverId.toLowerCase();
        driverIds.add(normalizedId);
        driverTeamMap.set(normalizedId, {
          teamName: team.teamName,
          driverNumber: driverData.driverNumber,
        });
      }
    }

    // Fetch all drivers and create a case-insensitive lookup map
    // This handles cases where driver IDs might be stored with different casing
    const allDrivers = await prisma.driver.findMany();
    
    // Create a map of normalized driverId to driver for quick lookup
    const driverMap = new Map<string, typeof allDrivers[0]>();
    for (const driver of allDrivers) {
      const normalized = driver.driverId.toLowerCase();
      // Store the first match we find (case-insensitive)
      if (!driverMap.has(normalized)) {
        driverMap.set(normalized, driver);
      }
    }

    // Build result array maintaining team order
    const result: Array<{
      driverId: string;
      driverNumber: number | null;
      teamName: string;
      driver: typeof allDrivers[0];
    }> = [];

    for (const team of lineupData.teams) {
      for (const driverData of team.drivers) {
        const normalizedId = driverData.driverId.toLowerCase();
        const driver = driverMap.get(normalizedId);
        
        if (driver) {
          const teamInfo = driverTeamMap.get(normalizedId)!;
          result.push({
            driverId: driverData.driverId,
            driverNumber: teamInfo.driverNumber,
            teamName: teamInfo.teamName,
            driver,
          });
        } else {
          // Log missing drivers for debugging
          logger.warn(`Driver not found in database: ${driverData.driverId} (normalized: ${normalizedId}) for season ${season}. Available driver IDs: ${Array.from(driverMap.keys()).join(', ')}`);
        }
      }
    }

    return result;
  },

  /**
   * Get constructor lineup for a season
   * Returns constructor IDs from the JSON array
   */
  async getConstructorLineup(season: number) {
    const lineupRecord = await prisma.constructorSeasonLineup.findUnique({
      where: { season },
    });

    if (!lineupRecord || !lineupRecord.constructors) {
      return [];
    }

    const constructorIds = lineupRecord.constructors as unknown as string[];
    const result = [];

    // Fetch constructor details for each ID
    for (const constructorId of constructorIds) {
      const constructor = await prisma.constructor.findUnique({
        where: { constructorId },
      });

      if (constructor) {
        result.push({ constructor });
      }
    }

    return result;
  },

  /**
   * Upsert driver lineup for a season
   */
  async upsertDriverLineup(season: number, lineupData: DriverLineupJson) {
    return prisma.driverSeasonLineup.upsert({
      where: { season },
      create: {
        season,
        lineup: lineupData as any,
      },
      update: {
        lineup: lineupData as any,
        updatedAt: new Date(),
      },
    });
  },

  /**
   * Upsert constructor lineup for a season
   */
  async upsertConstructorLineup(season: number, constructorIds: string[]) {
    return prisma.constructorSeasonLineup.upsert({
      where: { season },
      create: {
        season,
        constructors: constructorIds as any,
      },
      update: {
        constructors: constructorIds as any,
        updatedAt: new Date(),
      },
    });
  },
};
