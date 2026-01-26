import { Request, Response, NextFunction } from 'express';
import { sendSuccess, getCorrelationId } from '../utils/response';
import { ApiError } from '../utils/errors';
import { syncDriversFromFastF1 } from '../jobs/sync-drivers-fastf1';
import { z } from 'zod';

const syncDriversBodySchema = z.object({
  seasons: z.array(z.number().int().positive()).optional(),
});

export const syncDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const body = syncDriversBodySchema.parse(req.body);
    
    await syncDriversFromFastF1(body.seasons);
    
    sendSuccess(
      res,
      { message: 'Driver sync initiated successfully' },
      correlationId
    );
  } catch (error) {
    next(error);
  }
};
