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

// KVKK / GDPR Uyumlu PII Sanitizer Middleware
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

// 1. OpenAPI / Swagger Documentation Endpoint (/api/docs)
app.get('/api/docs', (_req, res) => {
  res.status(200).json({
    openapi: '3.0.0',
    info: {
      title: 'KintsugiText Moderation & Content Safety API',
      version: '1.0.0',
      description: 'Turkish-focused Two-Tier (Rule Engine + Python AI) Content Safety Engine for Gilded Platform'
    },
    servers: [{ url: 'http://localhost:4000' }],
    paths: {
      '/api/v1/moderate': {
        post: {
          summary: 'Analyze and moderate Turkish text',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    text: { type: 'string', example: 's4l4m apt*l seni bulacağım.' },
                    entity_type: { type: 'string', example: 'comment' },
                    tenant_id: { type: 'string', example: 'gilded_prod' },
                    force_ai: { type: 'boolean', example: false }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Successful moderation response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      score: { type: 'integer', example: 82 },
                      risk: { type: 'string', example: 'High' },
                      allowed: { type: 'boolean', example: false },
                      categories: { type: 'array', items: { type: 'string' }, example: ['toxicity', 'threat'] },
                      processed_text: { type: 'string', example: 'salam ***** seni bulacağım.' },
                      ai_summary: { type: 'string', example: 'Potential threatening language detected.' },
                      recommendation: { type: 'string', example: 'Review before publishing' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/health': { get: { summary: 'Check API Liveness/Readiness status' } },
      '/api/v1/rules': { get: { summary: 'List active moderation rules' }, post: { summary: 'Add a new moderation rule' } },
      '/api/v1/moderation/queue': { get: { summary: 'Get HITL Human Review Queue' } }
    }
  });
});

// 2. Healthcheck & Liveness Endpoint
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

// 3. Moderation Endpoint
app.post('/api/v1/moderate', moderationController.analyze);
app.post('/api/v1/analyze', moderationController.analyze);

// 4. Rules CRUD Endpoints
app.get('/api/v1/rules', rulesController.getRules);
app.post('/api/v1/rules', rulesController.addRule);
app.delete('/api/v1/rules/:id', rulesController.deleteRule);

// 5. HITL Moderatör Kuyruğu & Feedback Endpoints
app.get('/api/v1/moderation/queue', feedbackController.getQueue);
app.post('/api/v1/moderation/override', feedbackController.submitOverride);
app.get('/api/v1/moderation/dataset/export', feedbackController.exportDataset);

// 6. 404 Handler
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

// 7. Global Error Handler
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
