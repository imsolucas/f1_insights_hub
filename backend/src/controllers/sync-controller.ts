import { Request, Response, NextFunction } from 'express';
import { sendSuccess, getCorrelationId } from '../utils/response';
import { syncDriversFromFastF1 } from '../jobs/sync-drivers-fastf1';
import { syncConstructorsFromFastF1 } from '../jobs/sync-constructors-fastf1';
import { syncLineupsFromFastF1 } from '../jobs/sync-lineups-fastf1';
import { syncConstructorsRequestSchema } from '../schemas/sync';
import { z } from 'zod';

const syncDriversBodySchema = z.object({
  seasons: z.array(z.number().int().positive()).optional(),
  season: z.number().int().positive().optional(),
  filter_confirmed: z.boolean().optional(),
});

export const syncDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const body = syncDriversBodySchema.parse(req.body);
    
    await syncDriversFromFastF1(
      body.seasons,
      body.season,
      body.filter_confirmed
    );
    
    sendSuccess(
      res,
      { message: 'Driver sync initiated successfully' },
      correlationId
    );
  } catch (error) {
    next(error);
  }
};

export const syncConstructors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const body = syncConstructorsRequestSchema.parse(req.body);
    
    await syncConstructorsFromFastF1(
      body.seasons,
      body.season
    );
    
    sendSuccess(
      res,
      { message: 'Constructor sync initiated successfully' },
      correlationId
    );
  } catch (error) {
    next(error);
  }
};

const syncLineupsBodySchema = z.object({
  season: z.number().int().positive(),
});

export const syncLineups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const body = syncLineupsBodySchema.parse(req.body);
    
    await syncLineupsFromFastF1(body.season);
    
    sendSuccess(
      res,
      { message: 'Lineup sync initiated successfully' },
      correlationId
    );
  } catch (error) {
    next(error);
  }
};
