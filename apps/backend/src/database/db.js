import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE_PATH = path.join(__dirname, 'kintsugi_db.json');
const SEED_FILE_PATH = path.join(__dirname, 'seed.json');

export class DatabaseService {
  static instance;
  db = { rules: [], analysis_logs: [] };

  constructor() {
    this.init();
  }

  static getInstance() {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileData = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.db = JSON.parse(fileData);
      } else {
        this.seed();
      }
    } catch (err) {
      console.error('Database initialization error, falling back to seed:', err);
      this.seed();
    }
  }

  seed() {
    if (fs.existsSync(SEED_FILE_PATH)) {
      const seedData = JSON.parse(fs.readFileSync(SEED_FILE_PATH, 'utf-8'));
      this.db.rules = (seedData.rules || []).map((r) => ({
        ...r,
        created_at: r.created_at || new Date().toISOString()
      }));
      this.db.analysis_logs = [];
      this.persist();
      console.log(`✅ Database successfully seeded with ${this.db.rules.length} rules!`);
    } else {
      console.warn('⚠️ seed.json file not found, creating empty database.');
      this.db = { rules: [], analysis_logs: [] };
      this.persist();
    }
  }

  persist() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  getRules() {
    return this.db.rules.filter((r) => r.is_active);
  }

  getAllRules() {
    return this.db.rules;
  }

  addRule(ruleData) {
    const newRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pattern: ruleData.pattern,
      category: ruleData.category,
      score: Number(ruleData.score),
      reason: ruleData.reason,
      is_active: true,
      created_at: new Date().toISOString()
    };
    this.db.rules.push(newRule);
    this.persist();
    return newRule;
  }

  deleteRule(id) {
    const initialLength = this.db.rules.length;
    this.db.rules = this.db.rules.filter((r) => r.id !== id);
    if (this.db.rules.length !== initialLength) {
      this.persist();
      return true;
    }
    return false;
  }

  addLog(log) {
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...log,
      created_at: new Date().toISOString()
    };
    this.db.analysis_logs.unshift(newLog);
    if (this.db.analysis_logs.length > 500) {
      this.db.analysis_logs = this.db.analysis_logs.slice(0, 500);
    }
    this.persist();
    return newLog;
  }

  getLogs(limit = 50) {
    return this.db.analysis_logs.slice(0, limit);
  }
}
