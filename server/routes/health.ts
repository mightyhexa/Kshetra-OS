import { Router, Request, Response } from 'express';

export const healthRouter = Router();

// GET /api/health (No auth required)
healthRouter.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'KSHETRA OS API Server',
    version: '2026.1.0',
    spec: 'SIH26014 Land Stack',
    timestamp: new Date().toISOString()
  });
});
