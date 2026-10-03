import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { repository } from '../repo';

export const layersRouter = Router();

// GET /api/layers/waterbodies
layersRouter.get('/waterbodies', requireAuth, async (req: Request, res: Response) => {
  const waterbodies = await repository.getWaterbodies();
  res.json({
    success: true,
    count: waterbodies.length,
    data: waterbodies
  });
});
