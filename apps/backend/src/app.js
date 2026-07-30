import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { ModerationController } from './modules/moderation/moderation.controller.js';
import { RulesController } from './modules/rules/rules.controller.js';
import { FeedbackController } from './modules/moderation/feedback.controller.js';
import { PIISanitizer } from './shared/middlewares/pii-sanitizer.js';
import { DatabaseService } from './database/db.js';
import { Logger } from './shared/logger/logger.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// KVKK / GDPR Uyumlu PII Sanitizer Middleware (Tüm isteklere uygulanır)
app.use(PIISanitizer.middleware());

// Request Correlation ID & Logger Middleware
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  res.setHeader('X-Correlation-ID', req.correlationId);
  Logger.info(`HTTP ${req.method} ${req.url}`, { correlation_id: req.correlationId, ip: req.ip });
  next();
});

const moderationController = new ModerationController();
const rulesController = new RulesController();
const feedbackController = new FeedbackController();
const dbService = DatabaseService.getInstance();

// 1. Healthcheck Endpoint
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'KintsugiText Moderation Engine',
    env: env.NODE_ENV,
    active_rules_count: dbService.getRules().length,
    timestamp: new Date().toISOString()
  });
});

app.get('/healthz', (_req, res) => {
  res.redirect('/api/v1/health');
});

// 2. Moderation Endpoint
app.post('/api/v1/moderate', moderationController.analyze);
app.post('/api/v1/analyze', moderationController.analyze);

// 3. Rules CRUD Endpoints
app.get('/api/v1/rules', rulesController.getRules);
app.post('/api/v1/rules', rulesController.addRule);
app.delete('/api/v1/rules/:id', rulesController.deleteRule);

// 4. HITL Moderatör Kuyruğu & Feedback Endpoints
app.get('/api/v1/moderation/queue', feedbackController.getQueue);
app.post('/api/v1/moderation/override', feedbackController.submitOverride);
app.get('/api/v1/moderation/dataset/export', feedbackController.exportDataset);

// 5. 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'İstenen API uç noktası bulunamadı.'
    },
    meta: {
      timestamp: new Date().toISOString(),
      correlation_id: `req_${Date.now()}`
    }
  });
});

// 6. Global Error Handler
app.use((err, _req, res, _next) => {
  Logger.error('Unhandled Global Error', { error: err.message });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Sunucu içi beklenmeyen bir hata oluştu.'
    },
    meta: {
      timestamp: new Date().toISOString(),
      correlation_id: `req_${Date.now()}`
    }
  });
});

export default app;
