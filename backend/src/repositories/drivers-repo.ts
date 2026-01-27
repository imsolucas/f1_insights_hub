import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { lineupRepo } from './lineup-repo';

export const driversRepo = {
  async findAll(params?: { season?: number; limit?: number; offset?: number; active?: boolean }) {
    const where: Prisma.DriverWhereInput = {};

    if (params?.active !== undefined) {
      where.isActive = params.active;
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        // Default sort: by team, then surname
        orderBy: [
          { currentTeam: 'asc' },
          { surname: 'asc' },
          { forename: 'asc' },
        ],
        ...(params?.limit !== undefined && { take: params.limit }),
        ...(params?.offset !== undefined && { skip: params.offset }),
      }),
      prisma.driver.count({ where }),
    ]);

    // If season filter, filter by drivers who participated in that season
    // For future seasons (2026+), use is_active flag and current_team to determine active drivers
    if (params?.season) {
      const currentYear = new Date().getFullYear();
      
      // For future seasons (not yet started), try lineup data first, then fallback to is_active
      if (params.season > currentYear) {
        const lineup = await lineupRepo.getDriverLineup(params.season);
        let filteredDrivers = drivers;
        
        if (lineup.length > 0) {
          // Use lineup data to filter drivers
          const lineupDriverIds = lineup.map(l => l.driverId);
          filteredDrivers = drivers.filter((d) => lineupDriverIds.includes(d.id));
          
          // Create a map of driver ID to team name from lineup for sorting
          const teamNameMap = new Map(lineup.map(l => [l.driverId, l.teamName]));
          
          // Sort by team name from lineup, then by surname
          filteredDrivers.sort((a, b) => {
            const teamA = teamNameMap.get(a.id) || a.currentTeam || '';
            const teamB = teamNameMap.get(b.id) || b.currentTeam || '';
            if (teamA !== teamB) {
              return teamA.localeCompare(teamB);
            }
            return a.surname.localeCompare(b.surname);
          });
        } else {
          // Fallback: filter by is_active drivers
          filteredDrivers = drivers.filter((d) => d.isActive === true);
          
          // Sort by team name, then by surname
          filteredDrivers.sort((a, b) => {
            if (a.currentTeam !== b.currentTeam) {
              return (a.currentTeam || '').localeCompare(b.currentTeam || '');
            }
            return a.surname.localeCompare(b.surname);
          });
        }
        
        return { drivers: filteredDrivers, total: filteredDrivers.length };
      }
      
      // For past/current seasons, try to filter by drivers who participated in races
      const seasonDrivers = await prisma.raceResult.findMany({
        where: {
          race: {
            season: params.season,
          },
        },
        select: {
          driverId: true,
          constructor: false,
        },
        distinct: ['driverId'],
      });

      let filteredDrivers = drivers;

      // If we have race results for this season, filter by them
      if (seasonDrivers.length > 0) {
        const driverIds = seasonDrivers.map((r) => r.driverId);
        filteredDrivers = drivers.filter((d) => driverIds.includes(d.id));
      }
      
      // If no race results found (season hasn't started or no data synced yet),
      // fall back to showing all drivers (respecting active filter if set)
      // This allows viewing drivers even before race data is available
      
      // Sort by team name, then by surname
      filteredDrivers.sort((a, b) => {
        if (a.currentTeam !== b.currentTeam) {
          return (a.currentTeam || '').localeCompare(b.currentTeam || '');
        }
        return a.surname.localeCompare(b.surname);
      });
      
      return { drivers: filteredDrivers, total: filteredDrivers.length };
    }

    return { drivers, total };
  },

  async findById(id: string) {
    return prisma.driver.findUnique({
      where: { id },
    });
  },

  async findByDriverId(driverId: string) {
    return prisma.driver.findUnique({
      where: { driverId },
    });
  },

  async getDriverResults(driverId: string, limit?: number) {
    const driver = await this.findByDriverId(driverId);
    if (!driver) {
      return [];
    }
    
    return prisma.raceResult.findMany({
      where: {
        driverId: driver.id,
      },
      include: {
        race: {
          include: {
            circuit: true,
          },
        },
        constructor: true,
      },
      orderBy: {
        race: {
          date: 'desc',
        },
      },
      ...(limit !== undefined && { take: limit }),
    });
  },

  async getDriverStats(driverId: string) {
    const driver = await this.findByDriverId(driverId);
    if (!driver) {
      return null;
    }

    const [totalRaces, totalPoints, wins, podiums] = await Promise.all([
      prisma.raceResult.count({
        where: { driverId: driver.id },
      }),
      prisma.raceResult.aggregate({
        where: { driverId: driver.id },
        _sum: { points: true },
      }),
      prisma.raceResult.count({
        where: {
          driverId: driver.id,
          position: 1,
        },
      }),
      prisma.raceResult.count({
        where: {
          driverId: driver.id,
          position: { in: [1, 2, 3] },
        },
      }),
    ]);

    return {
      driver,
      totalRaces,
      totalPoints: totalPoints._sum.points || 0,
      wins,
      podiums,
    };
  },
};