import { prisma } from '../lib/prisma';

export const lineupRepo = {
  /**
   * Get driver lineup for a season
   */
  async getDriverLineup(season: number) {
    return prisma.driverSeasonLineup.findMany({
      where: { season },
      include: { driver: true },
      orderBy: [
        { teamName: 'asc' },
        { driver: { surname: 'asc' } },
        { driver: { forename: 'asc' } },
      ],
    });
  },

  /**
   * Get constructor lineup for a season
   */
  async getConstructorLineup(season: number) {
    const lineups = await prisma.constructorSeasonLineup.findMany({
      where: { season },
      include: { constructor: true },
    });
    
    // Sort by constructor name
    return lineups.sort((a, b) => {
      const nameA: string = a.constructor.name;
      const nameB: string = b.constructor.name;
      return nameA.localeCompare(nameB);
    });
  },
};
