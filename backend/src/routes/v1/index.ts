import { Router } from 'express';
import { racesRouter } from './races';
import { driversRouter } from './drivers';
import { constructorsRouter } from './constructors';
import { circuitsRouter } from './circuits';
import { syncRouter } from './sync';

const router = Router();

router.use('/races', racesRouter);
router.use('/drivers', driversRouter);
router.use('/constructors', constructorsRouter);
router.use('/circuits', circuitsRouter);
router.use('/sync', syncRouter);

export default router;