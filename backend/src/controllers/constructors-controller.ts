import { Request, Response, NextFunction } from 'express';
import { constructorsRepo } from '../repositories/constructors-repo';
import { lineupRepo } from '../repositories/lineup-repo';
import { sendSuccess, getCorrelationId } from '../utils/response';
import { ApiError } from '../utils/errors';
import { getConstructorsQuerySchema, getConstructorParamsSchema } from '../schemas/constructors';

export const getConstructors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const query = getConstructorsQuerySchema.parse(req.query);
    
    const { constructors, total } = await constructorsRepo.findAll({
      ...(query.season !== undefined && { season: query.season }),
      ...(query.limit !== undefined && { limit: query.limit }),
      ...(query.offset !== undefined && { offset: query.offset }),
    });

    sendSuccess(res, { constructors, total, limit: query.limit, offset: query.offset }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getConstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getConstructorParamsSchema.parse(req.params);
    
    const constructor = await constructorsRepo.findByConstructorId(params.constructorId);
    
    if (!constructor) {
      throw new ApiError(404, 'NOT_FOUND', `Constructor with id ${params.constructorId} not found`);
    }

    sendSuccess(res, { constructor }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getConstructorResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getConstructorParamsSchema.parse(req.params);
    
    const constructor = await constructorsRepo.findByConstructorId(params.constructorId);
    if (!constructor) {
      throw new ApiError(404, 'NOT_FOUND', `Constructor with id ${params.constructorId} not found`);
    }

    const results = await constructorsRepo.getConstructorResults(constructor.id, 50);
    sendSuccess(res, { constructor, results }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getConstructorStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getConstructorParamsSchema.parse(req.params);
    
    const stats = await constructorsRepo.getConstructorStats(params.constructorId);
    if (!stats) {
      throw new ApiError(404, 'NOT_FOUND', `Constructor with id ${params.constructorId} not found`);
    }

    sendSuccess(res, stats, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getConstructorsLineup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const query = getConstructorsQuerySchema.parse(req.query);
    
    if (!query.season) {
      throw new ApiError(400, 'BAD_REQUEST', 'Season parameter is required for lineup endpoint');
    }

    const lineups = await lineupRepo.getConstructorLineup(query.season);
    
    // Transform lineup data to match constructor format
    const constructors = lineups.map((lineup) => lineup.constructor);

    sendSuccess(res, { constructors, total: constructors.length, season: query.season }, correlationId);
  } catch (error) {
    next(error);
  }
};