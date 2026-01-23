import { Router, Request, Response } from 'express';
import { sendSuccess, getCorrelationId } from '../utils/response';
import v1Router from './v1';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const correlationId = getCorrelationId(_req);
  sendSuccess(res, { status: 'OK' }, correlationId);
});

router.get('/api/v1', (_req: Request, res: Response) => {
  const correlationId = getCorrelationId(_req);
  sendSuccess(
    res,
    {
      version: '1.0.0',
      status: 'OK',
    },
    correlationId
  );
});

router.use('/api/v1', v1Router);

export default router;
