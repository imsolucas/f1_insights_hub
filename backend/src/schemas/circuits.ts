import { z } from 'zod';

export const getCircuitParamsSchema = z.object({
  circuitId: z.string(),
});