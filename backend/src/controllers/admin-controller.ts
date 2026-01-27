import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { sendSuccess, getCorrelationId } from '../utils/response';
import { ApiError } from '../utils/errors';
import {
  updateDriverSchema,
  updateConstructorSchema,
  createDriverSchema,
  createConstructorSchema,
} from '../schemas/admin';
import { logger } from '../utils/logger';

export const updateDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const body = updateDriverSchema.parse(req.body);

    const driver = await prisma.driver.findUnique({
      where: { driverId: body.driverId },
    });

    if (!driver) {
      throw new ApiError(404, 'NOT_FOUND', `Driver with id ${body.driverId} not found`);
    }

    const updateData: any = {};
    if (body.code !== undefined) updateData.code = body.code;
    if (body.forename !== undefined) updateData.forename = body.forename;
    if (body.surname !== undefined) updateData.surname = body.surname;
    if (body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }
    if (body.nationality !== undefined) updateData.nationality = body.nationality;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.permanentNumber !== undefined) updateData.permanentNumber = body.permanentNumber;
    if (body.currentTeam !== undefined) updateData.currentTeam = body.currentTeam;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.driverChampionships !== undefined) updateData.driverChampionships = body.driverChampionships;
    if (body.constructorChampionships !== undefined) updateData.constructorChampionships = body.constructorChampionships;

    const updatedDriver = await prisma.driver.update({
      where: { driverId: body.driverId },
      data: updateData,
    });

    logger.info(`[Admin] Updated driver ${body.driverId}`, { correlationId, updates: Object.keys(updateData) });

    sendSuccess(res, { driver: updatedDriver }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const createDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const body = createDriverSchema.parse(req.body);

    const existingDriver = await prisma.driver.findUnique({
      where: { driverId: body.driverId },
    });

    if (existingDriver) {
      throw new ApiError(409, 'CONFLICT', `Driver with id ${body.driverId} already exists`);
    }

    const driver = await prisma.driver.create({
      data: {
        driverId: body.driverId,
        code: body.code || null,
        forename: body.forename,
        surname: body.surname,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        nationality: body.nationality,
        url: body.url || null,
        permanentNumber: body.permanentNumber || null,
        currentTeam: body.currentTeam || null,
        isActive: body.isActive ?? true,
        driverChampionships: body.driverChampionships ?? 0,
        constructorChampionships: body.constructorChampionships ?? 0,
      },
    });

    logger.info(`[Admin] Created driver ${body.driverId}`, { correlationId });

    sendSuccess(res, { driver }, correlationId, 201);
  } catch (error) {
    next(error);
  }
};

export const updateConstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const body = updateConstructorSchema.parse(req.body);

    const constructor = await prisma.constructor.findUnique({
      where: { constructorId: body.constructorId },
    });

    if (!constructor) {
      throw new ApiError(404, 'NOT_FOUND', `Constructor with id ${body.constructorId} not found`);
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.nationality !== undefined) updateData.nationality = body.nationality;
    if (body.url !== undefined) updateData.url = body.url;

    const updatedConstructor = await prisma.constructor.update({
      where: { constructorId: body.constructorId },
      data: updateData,
    });

    logger.info(`[Admin] Updated constructor ${body.constructorId}`, { correlationId, updates: Object.keys(updateData) });

    sendSuccess(res, { constructor: updatedConstructor }, correlationId);
  } catch (error) {
    next(error);
  }
};

export const createConstructor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const body = createConstructorSchema.parse(req.body);

    const existingConstructor = await prisma.constructor.findUnique({
      where: { constructorId: body.constructorId },
    });

    if (existingConstructor) {
      throw new ApiError(409, 'CONFLICT', `Constructor with id ${body.constructorId} already exists`);
    }

    const constructor = await prisma.constructor.create({
      data: {
        constructorId: body.constructorId,
        name: body.name,
        nationality: body.nationality,
        url: body.url || null,
      },
    });

    logger.info(`[Admin] Created constructor ${body.constructorId}`, { correlationId });

    sendSuccess(res, { constructor }, correlationId, 201);
  } catch (error) {
    next(error);
  }
};

export const updateDriverTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const correlationId = getCorrelationId(req);
    const driverId = req.params.driverId as string;
    const { teamName } = req.body;

    if (!driverId) {
      throw new ApiError(400, 'BAD_REQUEST', 'driverId is required');
    }

    if (typeof teamName !== 'string' && teamName !== null) {
      throw new ApiError(400, 'BAD_REQUEST', 'teamName must be a string or null');
    }

    const driver = await prisma.driver.findUnique({
      where: { driverId },
    });

    if (!driver) {
      throw new ApiError(404, 'NOT_FOUND', `Driver with id ${driverId} not found`);
    }

    const updatedDriver = await prisma.driver.update({
      where: { driverId },
      data: { currentTeam: teamName },
    });

    logger.info(`[Admin] Updated driver ${driverId} team to ${teamName}`, { correlationId });

    sendSuccess(res, { driver: updatedDriver }, correlationId);
  } catch (error) {
    next(error);
  }
};
