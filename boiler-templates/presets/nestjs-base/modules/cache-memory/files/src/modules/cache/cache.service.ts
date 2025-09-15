import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as NodeCache from 'node-cache';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly client: NodeCache;

  constructor(private configService: ConfigService) {
    const defaultTtl = this.configService.get<number>('CACHE_TTL', 3600); // 1 hour default
    const checkPeriod = this.configService.get<number>('CACHE_CHECK_PERIOD', 600); // 10 minutes default
    const maxKeys = this.configService.get<number>('CACHE_MAX_KEYS', 10000); // 10k keys default
    const useClones = this.configService.get<boolean>('CACHE_USE_CLONES', false);

    this.client = new NodeCache({
      stdTTL: defaultTtl,
      checkperiod: checkPeriod,
      maxKeys: maxKeys,
      useClones: useClones,
    });

    this.client.on('set', (key, value) => {
      this.logger.debug(`Cache key set: ${key}`);
    });

    this.client.on('del', (key, value) => {
      this.logger.debug(`Cache key deleted: ${key}`);
    });

    this.client.on('expired', (key, value) => {
      this.logger.debug(`Cache key expired: ${key}`);
    });

    this.client.on('flush', () => {
      this.logger.debug('Cache flushed');
    });

    this.logger.log('Memory cache client initialized');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = this.client.get<T>(key);
      return value !== undefined ? value : null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const success = this.client.set(key, value, ttlSeconds || 0);
      return success;
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = this.client.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return this.client.has(key);
    } catch (error) {
      this.logger.error(`Error checking cache key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const allKeys = this.client.keys();

      // Convert glob pattern to regex
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
        .replace(/\[([^\]]+)\]/g, '[$1]');

      const regex = new RegExp(`^${regexPattern}$`);

      return allKeys.filter(key => regex.test(key));
    } catch (error) {
      this.logger.error(`Error getting cache keys with pattern ${pattern}:`, error);
      return [];
    }
  }

  async flushAll(): Promise<boolean> {
    try {
      this.client.flushAll();
      return true;
    } catch (error) {
      this.logger.error('Error flushing all cache:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const ttl = this.client.getTtl(key);
      if (ttl === 0) {
        // Key doesn't exist or has no TTL
        return this.client.has(key) ? -1 : -2;
      }
      // Convert milliseconds to seconds and calculate remaining time
      const now = Date.now();
      const remainingSeconds = Math.floor((ttl - now) / 1000);
      return remainingSeconds > 0 ? remainingSeconds : -2;
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      // Get the current value
      const value = this.client.get(key);
      if (value === undefined) {
        return false; // Key doesn't exist
      }

      // Set the key again with new TTL
      return this.client.set(key, value, seconds);
    } catch (error) {
      this.logger.error(`Error setting expiration for key ${key}:`, error);
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      const currentValue = this.client.get<number>(key) || 0;
      const newValue = currentValue + 1;
      this.client.set(key, newValue);
      return newValue;
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}:`, error);
      return 0;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      const currentValue = this.client.get<number>(key) || 0;
      const newValue = currentValue - 1;
      this.client.set(key, newValue);
      return newValue;
    } catch (error) {
      this.logger.error(`Error decrementing key ${key}:`, error);
      return 0;
    }
  }

  onModuleDestroy() {
    this.client.close();
    this.logger.log('Memory cache client closed');
  }
}