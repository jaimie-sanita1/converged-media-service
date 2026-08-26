import express, { Application, Request, Response, NextFunction } from 'express';
import campaignsRouter from './routes/campaigns';
import mediaPlansRouter from './routes/mediaPlans';

export function createApp(): Application {
  const app = express();

  // ── Global middleware ──────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger (dev-friendly)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use('/v1/campaigns', campaignsRouter);

  // Mount at both /v1/media-plans and /v1/media-plans/ to match collection URL
  // (collection uses a trailing slash: /v1/media-plans/?planId=...)
  app.use('/v1/media-plans', mediaPlansRouter);

  // ── Health check ───────────────────────────────────────────────────────────
  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  };

  app.get('/health', healthHandler);
  app.get('/healthz', healthHandler);

  // ── 404 handler ────────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested endpoint does not exist.',
      statusCode: 404,
    });
  });

  // ── Global error handler ───────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[ERROR]', err.message, err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message ?? 'An unexpected error occurred.',
      statusCode: 500,
    });
  });

  return app;
}
