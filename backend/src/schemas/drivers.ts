import { z } from 'zod';

export const getDriversQuerySchema = z.object({
  season: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export const getDriverParamsSchema = z.object({
  driverId: z.string(),
});