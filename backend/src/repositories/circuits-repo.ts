import { prisma } from '../lib/prisma';

export const circuitsRepo = {
  async findAll() {
    return prisma.circuit.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.circuit.findUnique({
      where: { id },
    });
  },

  async findByCircuitId(circuitId: string) {
    return prisma.circuit.findUnique({
      where: { circuitId },
    });
  },

  async getCircuitRaces(circuitId: string) {
    const circuit = await this.findByCircuitId(circuitId);
    if (!circuit) {
      return [];
    }

    return prisma.race.findMany({
      where: {
        circuitId: circuit.id,
      },
      include: {
        circuit: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  },
};