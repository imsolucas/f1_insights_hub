import { prisma } from '../lib/prisma';

export const resultsRepo = {
  async getRaceResults(raceId: string) {
    return prisma.raceResult.findMany({
      where: { raceId },
      include: {
        driver: true,
        constructor: true,
      },
      orderBy: { position: 'asc' },
    });
  },

  async getQualifyingResults(raceId: string) {
    return prisma.qualifyingResult.findMany({
      where: { raceId },
      include: {
        driver: true,
        constructor: true,
      },
      orderBy: { position: 'asc' },
    });
  },
};