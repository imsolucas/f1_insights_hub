import { Router } from 'express';
import {
  updateDriver,
  createDriver,
  updateConstructor,
  createConstructor,
  updateDriverTeam,
} from '../../controllers/admin-controller';

const router = Router();

// Driver management
router.put('/drivers', updateDriver);
router.post('/drivers', createDriver);
router.patch('/drivers/:driverId/team', updateDriverTeam);

// Constructor management
router.put('/constructors', updateConstructor);
router.post('/constructors', createConstructor);

export default router;
