import crypto from 'crypto';

export class SemanticCacheService {
  static instance;
  cache = new Map();
  ttlMs = 1000 * 60 * 60; // 1 Saat Önbellek Süresi

  static getInstance() {
    if (!SemanticCacheService.instance) {
      SemanticCacheService.instance = new SemanticCacheService();
    }
    return SemanticCacheService.instance;
  }

  hashText(text) {
    return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
  }

  get(text) {
    const key = this.hashText(text);
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(text, result) {
    const key = this.hashText(text);
    this.cache.set(key, {
      value: result,
      expiresAt: Date.now() + this.ttlMs
    });

    // Cache sınırlandırma (Max 10,000 kayıt)
    if (this.cache.size > 10000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}
