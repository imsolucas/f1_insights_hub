import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const driversRepo = {
  async findAll(params?: { season?: number; limit?: number; offset?: number; active?: boolean }) {
    const where: Prisma.DriverWhereInput = {};

    if (params?.active !== undefined) {
      where.isActive = params.active;
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        orderBy: [
          { surname: 'asc' },
          { forename: 'asc' },
        ],
        ...(params?.limit !== undefined && { take: params.limit }),
        ...(params?.offset !== undefined && { skip: params.offset }),
      }),
      prisma.driver.count({ where }),
    ]);

    // If season filter, filter by drivers who participated in that season
    if (params?.season) {
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

      const driverIds = seasonDrivers.map((r) => r.driverId);
      const filteredDrivers = drivers.filter((d) => driverIds.includes(d.id));
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