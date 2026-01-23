import { z } from 'zod';

export const getRacesQuerySchema = z.object({
  season: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export const getRaceParamsSchema = z.object({
  raceId: z.string().cuid(),
});