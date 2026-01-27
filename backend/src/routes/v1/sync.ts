import { Router } from 'express';
import { syncDrivers, syncConstructors, syncLineups } from '../../controllers/sync-controller';

const router = Router();

router.post('/drivers', syncDrivers);
router.post('/constructors', syncConstructors);
router.post('/lineups', syncLineups);

export const syncRouter = router;
