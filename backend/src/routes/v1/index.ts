import { Router } from 'express';
import { racesRouter } from './races';
import { driversRouter } from './drivers';
import { constructorsRouter } from './constructors';
import { circuitsRouter } from './circuits';

const router = Router();

router.use('/races', racesRouter);
router.use('/drivers', driversRouter);
router.use('/constructors', constructorsRouter);
router.use('/circuits', circuitsRouter);

export default router;