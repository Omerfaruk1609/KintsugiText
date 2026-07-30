import { DatabaseService } from '../../database/db.js';

export class RulesController {
  constructor() {
    this.db = DatabaseService.getInstance();
  }

  getRules = (_req, res) => {
    const rules = this.db.getRules();
    const response = {
      success: true,
      data: rules,
      meta: {
        timestamp: new Date().toISOString(),
        correlation_id: `req_${Date.now()}`
      }
    };
    res.status(200).json(response);
  };

  addRule = (req, res) => {
    const { pattern, category, score, reason } = req.body;

    if (!pattern || !category || score === undefined || !reason) {
      const response = {
        success: false,
        error: {
          code: 'INVALID_RULE_DATA',
          message: 'Lütfen pattern, category, score (0-1) ve reason alanlarını eksiksiz girin.'
        },
        meta: {
          timestamp: new Date().toISOString(),
          correlation_id: `req_${Date.now()}`
        }
      };
      res.status(400).json(response);
      return;
    }

    try {
      new RegExp(pattern);

      const newRule = this.db.addRule({
        pattern,
        category,
        score: Number(score),
        reason
      });

      const response = {
        success: true,
        data: newRule,
        meta: {
          timestamp: new Date().toISOString(),
          correlation_id: `req_${Date.now()}`
        }
      };
      res.status(201).json(response);
    } catch (e) {
      const response = {
        success: false,
        error: {
          code: 'INVALID_REGEX',
          message: 'Girdiğiniz Regex ifadesi sözdizimsel olarak geçersiz.'
        },
        meta: {
          timestamp: new Date().toISOString(),
          correlation_id: `req_${Date.now()}`
        }
      };
      res.status(400).json(response);
    }
  };

  deleteRule = (req, res) => {
    const { id } = req.params;
    const deleted = this.db.deleteRule(id);

    if (!deleted) {
      const response = {
        success: false,
        error: {
          code: 'RULE_NOT_FOUND',
          message: `ID değeri '${id}' olan kural bulunamadı.`
        },
        meta: {
          timestamp: new Date().toISOString(),
          correlation_id: `req_${Date.now()}`
        }
      };
      res.status(404).json(response);
      return;
    }

    const response = {
      success: true,
      data: { id },
      meta: {
        timestamp: new Date().toISOString(),
        correlation_id: `req_${Date.now()}`
      }
    };
    res.status(200).json(response);
  };
}
