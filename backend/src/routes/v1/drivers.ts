import { Router } from 'express';
import {
  getDrivers,
  getDriver,
  getDriverResults,
  getDriverStats,
  getDriversLineup,
} from '../../controllers/drivers-controller';

export const driversRouter = Router();

driversRouter.get('/lineup', getDriversLineup);
driversRouter.get('/:driverId/results', getDriverResults);
driversRouter.get('/:driverId/stats', getDriverStats);
driversRouter.get('/:driverId', getDriver);
driversRouter.get('/', getDrivers);