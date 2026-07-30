import { ViolationCategoryEnum } from '@kintsugi/shared-types';
import { TurkishTextNormalizer } from './turkish-text.normalizer.js';
import { DatabaseService } from '../../database/db.js';

export class RuleEngineService {
  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  evaluate(rawText) {
    const normalizedText = TurkishTextNormalizer.normalize(rawText);
    const violations = [];
    const matchedRules = [];
    let highestScore = 0;

    const activeRules = this.dbService.getRules();

    for (const rule of activeRules) {
      try {
        const regex = new RegExp(rule.pattern, 'gi');
        
        if (regex.test(rawText) || regex.test(normalizedText)) {
          violations.push({
            category: rule.category || ViolationCategoryEnum.PROFANITY,
            score: rule.score,
            reason: rule.reason,
            matched_pattern: rule.pattern
          });

          matchedRules.push({
            rule_id: rule.id,
            pattern: rule.pattern,
            type: rule.category
          });

          if (rule.score > highestScore) {
            highestScore = rule.score;
          }
        }
      } catch (e) {
        console.error(`Invalid regex pattern in rule ${rule.id}: ${rule.pattern}`, e);
      }
    }

    return {
      normalizedText,
      flagged: violations.length > 0,
      highestScore,
      violations,
      matchedRules
    };
  }
}
