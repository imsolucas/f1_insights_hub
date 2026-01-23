import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const racesRepo = {
  async findAll(params?: { season?: number; limit?: number; offset?: number }) {
    const where: Prisma.RaceWhereInput = {};
    if (params?.season) {
      where.season = params.season;
    }

    const [races, total] = await Promise.all([
      prisma.race.findMany({
        where,
        include: {
          circuit: true,
        },
        orderBy: [
          { season: 'desc' },
          { round: 'asc' },
        ],
        ...(params?.limit !== undefined && { take: params.limit }),
        ...(params?.offset !== undefined && { skip: params.offset }),
      }),
      prisma.race.count({ where }),
    ]);

    return { races, total };
  },

  async findById(id: string) {
    return prisma.race.findUnique({
      where: { id },
      include: {
        circuit: true,
      },
    });
  },

  async findBySeasonAndRound(season: number, round: number) {
    return prisma.race.findUnique({
      where: { season_round: { season, round } },
      include: {
        circuit: true,
      },
    });
  },

  async findBySeason(season: number) {
    return prisma.race.findMany({
      where: { season },
      include: {
        circuit: true,
      },
      orderBy: { round: 'asc' },
    });
  },

  async getCurrentSeasonSchedule() {
    const currentYear = new Date().getFullYear();
    return this.findBySeason(currentYear);
  },
};