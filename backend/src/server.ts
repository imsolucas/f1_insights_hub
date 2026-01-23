import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import routes from './routes';
import { logger } from './utils/logger';
import { ApiError } from './utils/errors';
import { sendError, getCorrelationId } from './utils/response';
import { syncCurrentSeason } from './jobs/sync-current-season';
import { swaggerSpec } from './config/swagger';

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

app.use((req: Request, _res: Response, next: NextFunction) => {
  const correlationId = getCorrelationId(req);
  req.headers['x-correlation-id'] = correlationId;
  logger.info(`${req.method} ${req.path}`, { correlationId });
  next();
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'F1 Insight Hub API Documentation',
}));

app.use(routes);

app.use((req: Request, res: Response) => {
  const correlationId = getCorrelationId(req);
  sendError(res, new ApiError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`), correlationId);
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const correlationId = getCorrelationId(req);
  logger.error('Unhandled error', err, { correlationId, path: req.path, method: req.method });
  sendError(res, err, correlationId);
});

const PORT = config.PORT;

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`, {
    nodeEnv: config.NODE_ENV,
    port: PORT,
  });

  // Sync current season data on startup (non-blocking)
  syncCurrentSeason().catch((error) => {
    logger.error('Failed to sync current season on startup', error);
  });
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});
