import { Request, Response, NextFunction } from 'express';
import { racesRepo } from '../repositories/races-repo';
import { resultsRepo } from '../repositories/results-repo';
import { sendSuccess, getCorrelationId } from '../utils/response';
import { ApiError } from '../utils/errors';
import { getRacesQuerySchema, getRaceParamsSchema } from '../schemas/races';

export const getRaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const query = getRacesQuerySchema.parse(req.query);
    
    const { races, total } = await racesRepo.findAll({
      ...(query.season !== undefined && { season: query.season }),
      ...(query.limit !== undefined && { limit: query.limit }),
      ...(query.offset !== undefined && { offset: query.offset }),
    });

    sendSuccess(res, { races, total, limit: query.limit, offset: query.offset }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getRace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getRaceParamsSchema.parse(req.params);
    
    const race = await racesRepo.findById(params.raceId);
    
    if (!race) {
      throw new ApiError(404, 'NOT_FOUND', `Race with id ${params.raceId} not found`);
    }

    sendSuccess(res, { race }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getRaceResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getRaceParamsSchema.parse(req.params);
    
    const race = await racesRepo.findById(params.raceId);
    if (!race) {
      throw new ApiError(404, 'NOT_FOUND', `Race with id ${params.raceId} not found`);
    }

    const results = await resultsRepo.getRaceResults(params.raceId);
    sendSuccess(res, { race, results }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getQualifyingResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getRaceParamsSchema.parse(req.params);
    
    const race = await racesRepo.findById(params.raceId);
    if (!race) {
      throw new ApiError(404, 'NOT_FOUND', `Race with id ${params.raceId} not found`);
    }

    const results = await resultsRepo.getQualifyingResults(params.raceId);
    sendSuccess(res, { race, results }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getCurrentSeasonSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const races = await racesRepo.getCurrentSeasonSchedule();
    sendSuccess(res, { races }, correlationId);
  } catch (error) {
    next(error);
  }
};