import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const PORT = parseInt(process.env.PORT ?? '5000', 10);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100'),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  })
);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`ShopHub API running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
});

export default app;
