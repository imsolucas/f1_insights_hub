import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { lineupRepo } from './lineup-repo';

export const constructorsRepo = {
  async findAll(params?: { season?: number; limit?: number; offset?: number }) {
    const where: Prisma.ConstructorWhereInput = {};

    const [constructors, total] = await Promise.all([
      prisma.constructor.findMany({
        where,
        orderBy: { name: 'asc' },
        ...(params?.limit !== undefined && { take: params.limit }),
        ...(params?.offset !== undefined && { skip: params.offset }),
      }),
      prisma.constructor.count({ where }),
    ]);

    // If season filter, filter by constructors who participated in that season
    if (params?.season) {
      const seasonConstructors = await prisma.raceResult.findMany({
        where: {
          race: {
            season: params.season,
          },
        },
        select: {
          constructorId: true,
          constructor: false,
        },
        distinct: ['constructorId'],
      });

      let filteredConstructors: typeof constructors = constructors;

      // If we have race results for this season, filter by them
      if (seasonConstructors.length > 0) {
        const constructorIds = seasonConstructors.map((r) => r.constructorId);
        filteredConstructors = constructors.filter((c) => constructorIds.includes(c.id));
      }
      
      // If no race results found (season hasn't started or no data synced yet),
      // try to get lineup data for this season
      if (seasonConstructors.length === 0) {
        const lineup = await lineupRepo.getConstructorLineup(params.season);
        if (lineup.length > 0) {
          const lineupConstructorIds = lineup.map(l => l.constructor.id);
          filteredConstructors = constructors.filter((c) => lineupConstructorIds.includes(c.id));
        }
      }
      
      // Sort constructors by name
      filteredConstructors.sort((a, b) => {
        const nameA: string = a.name;
        const nameB: string = b.name;
        return nameA.localeCompare(nameB);
      });
      
      return { constructors: filteredConstructors, total: filteredConstructors.length };
    }

    return { constructors, total };
  },

  async findById(id: string) {
    return prisma.constructor.findUnique({
      where: { id },
    });
  },

  async findByConstructorId(constructorId: string) {
    return prisma.constructor.findUnique({
      where: { constructorId },
    });
  },

  async getConstructorResults(constructorId: string, limit?: number) {
    const constructor = await this.findByConstructorId(constructorId);
    if (!constructor) {
      return [];
    }
    
    return prisma.raceResult.findMany({
      where: {
        constructorId: constructor.id,
      },
      include: {
        race: {
          include: {
            circuit: true,
          },
        },
        driver: true,
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

  async getConstructorStats(constructorId: string) {
    const constructor = await this.findByConstructorId(constructorId);
    if (!constructor) {
      return null;
    }

    const [totalRaces, totalPoints, wins, podiums] = await Promise.all([
      prisma.raceResult.count({
        where: { constructorId: constructor.id },
      }),
      prisma.raceResult.aggregate({
        where: { constructorId: constructor.id },
        _sum: { points: true },
      }),
      prisma.raceResult.count({
        where: {
          constructorId: constructor.id,
          position: 1,
        },
      }),
      prisma.raceResult.count({
        where: {
          constructorId: constructor.id,
          position: { in: [1, 2, 3] },
        },
      }),
    ]);

    return {
      constructor,
      totalRaces,
      totalPoints: totalPoints._sum.points || 0,
      wins,
      podiums,
    };
  },
};