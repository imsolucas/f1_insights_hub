import { Request, Response, NextFunction } from 'express';
import { driversRepo } from '../repositories/drivers-repo';
import { sendSuccess, getCorrelationId } from '../utils/response';
import { ApiError } from '../utils/errors';
import { getDriversQuerySchema, getDriverParamsSchema } from '../schemas/drivers';

export const getDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const query = getDriversQuerySchema.parse(req.query);
    
    const { drivers, total } = await driversRepo.findAll({
      ...(query.season !== undefined && { season: query.season }),
      ...(query.limit !== undefined && { limit: query.limit }),
      ...(query.offset !== undefined && { offset: query.offset }),
      ...(query.active !== undefined && { active: query.active }),
    });

    sendSuccess(res, { drivers, total, limit: query.limit, offset: query.offset }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getDriverParamsSchema.parse(req.params);
    
    const driver = await driversRepo.findByDriverId(params.driverId);
    
    if (!driver) {
      throw new ApiError(404, 'NOT_FOUND', `Driver with id ${params.driverId} not found`);
    }

    sendSuccess(res, { driver }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getDriverResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getDriverParamsSchema.parse(req.params);
    
    const driver = await driversRepo.findByDriverId(params.driverId);
    if (!driver) {
      throw new ApiError(404, 'NOT_FOUND', `Driver with id ${params.driverId} not found`);
    }

    const results = await driversRepo.getDriverResults(driver.id, 50);
    sendSuccess(res, { driver, results }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getDriverStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getDriverParamsSchema.parse(req.params);
    
    const stats = await driversRepo.getDriverStats(params.driverId);
    if (!stats) {
      throw new ApiError(404, 'NOT_FOUND', `Driver with id ${params.driverId} not found`);
    }

    sendSuccess(res, stats, correlationId);
  } catch (error) {
    next(error);
  }
};