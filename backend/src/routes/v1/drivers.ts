import { Router } from 'express';
import {
  getDrivers,
  getDriver,
  getDriverResults,
  getDriverStats,
} from '../../controllers/drivers-controller';

export const driversRouter = Router();

driversRouter.get('/:driverId/results', getDriverResults);
driversRouter.get('/:driverId/stats', getDriverStats);
driversRouter.get('/:driverId', getDriver);
driversRouter.get('/', getDrivers);