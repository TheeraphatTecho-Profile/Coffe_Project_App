import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env';
import { farmRoutes } from './routes/farm.routes';
import { harvestRoutes } from './routes/harvest.routes';
import { healthRoutes } from './routes/health.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: ENV.CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/harvests', harvestRoutes);

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * Start the Express server.
 */
export function startServer(): void {
  app.listen(ENV.PORT, () => {
    console.log(`[Server] Running on port ${ENV.PORT} (${ENV.NODE_ENV})`);
  });
}

// Only start if run directly (not imported for testing)
if (require.main === module) {
  startServer();
}

export { app };
