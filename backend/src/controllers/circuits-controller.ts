import { Request, Response, NextFunction } from 'express';
import { circuitsRepo } from '../repositories/circuits-repo';
import { sendSuccess, getCorrelationId } from '../utils/response';
import { ApiError } from '../utils/errors';
import { getCircuitParamsSchema } from '../schemas/circuits';

export const getCircuits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const circuits = await circuitsRepo.findAll();
    sendSuccess(res, { circuits }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getCircuit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getCircuitParamsSchema.parse(req.params);
    
    const circuit = await circuitsRepo.findByCircuitId(params.circuitId);
    
    if (!circuit) {
      throw new ApiError(404, 'NOT_FOUND', `Circuit with id ${params.circuitId} not found`);
    }

    sendSuccess(res, { circuit }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const getCircuitRaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const params = getCircuitParamsSchema.parse(req.params);
    
    const circuit = await circuitsRepo.findByCircuitId(params.circuitId);
    if (!circuit) {
      throw new ApiError(404, 'NOT_FOUND', `Circuit with id ${params.circuitId} not found`);
    }

    const races = await circuitsRepo.getCircuitRaces(params.circuitId);
    sendSuccess(res, { circuit, races }, correlationId);
  } catch (error) {
    next(error);
  }
};