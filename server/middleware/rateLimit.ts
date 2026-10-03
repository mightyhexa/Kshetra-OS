import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  const { windowMs, max, message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();
    const key = `${req.baseUrl || req.path}:${ip}`;

    let record = rateLimitStore.get(key);
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(key, record);
    } else {
      record.count += 1;
    }

    if (record.count > max) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: message || `Too many requests. Please try again after ${retryAfterSec} seconds.`
        }
      });
      return;
    }

    next();
  };
}
