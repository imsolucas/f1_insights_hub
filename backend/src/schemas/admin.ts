import { z } from 'zod';

export const updateDriverSchema = z.object({
  driverId: z.string(),
  code: z.string().optional().nullable(),
  forename: z.string().optional(),
  surname: z.string().optional(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  nationality: z.string().optional(),
  url: z.string().url().optional().nullable(),
  permanentNumber: z.number().int().positive().max(99).optional().nullable(),
  currentTeam: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  driverChampionships: z.number().int().nonnegative().optional(),
  constructorChampionships: z.number().int().nonnegative().optional(),
});

export const updateConstructorSchema = z.object({
  constructorId: z.string(),
  name: z.string().optional(),
  nationality: z.string().optional(),
  url: z.string().url().optional().nullable(),
});

export const createDriverSchema = z.object({
  driverId: z.string(),
  code: z.string().optional().nullable(),
  forename: z.string(),
  surname: z.string(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  nationality: z.string(),
  url: z.string().url().optional().nullable(),
  permanentNumber: z.number().int().positive().max(99).optional().nullable(),
  currentTeam: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  driverChampionships: z.number().int().nonnegative().default(0),
  constructorChampionships: z.number().int().nonnegative().default(0),
});

export const createConstructorSchema = z.object({
  constructorId: z.string(),
  name: z.string(),
  nationality: z.string(),
  url: z.string().url().optional().nullable(),
});
