import { Router } from 'express';
import { syncDrivers } from '../../controllers/sync-controller';

const router = Router();

router.post('/drivers', syncDrivers);

export const syncRouter = router;
