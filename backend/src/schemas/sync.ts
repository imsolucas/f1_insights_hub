import { z } from 'zod';

export const syncConstructorsRequestSchema = z.object({
  seasons: z.array(z.number().int().positive()).optional(),
  season: z.number().int().positive().optional(),
});

export const syncConstructorsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  teams_synced: z.number().optional(),
  errors: z.array(z.string()).optional().nullable(),
});
