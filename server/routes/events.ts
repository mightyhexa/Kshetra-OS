import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { eventBroadcaster } from '../services/eventBroadcaster';

export const eventsRouter = Router();

// GET /api/events (Server-Sent Events)
eventsRouter.get('/', requireAuth, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering
  res.flushHeaders?.();

  // Send initial handshake
  const initPayload = {
    connected: true,
    user: req.user!.fullName,
    role: req.user!.role,
    timestamp: new Date().toISOString()
  };
  res.write(`event: CONNECTED\ndata: ${JSON.stringify(initPayload)}\n\n`);

  // Subscribe to system broadcasts
  eventBroadcaster.subscribe(res);

  // Keep-alive heartbeat every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});
