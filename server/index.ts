import express from 'express';
import { authRouter } from './routes/auth';
import { parcelsRouter } from './routes/parcels';
import { layersRouter } from './routes/layers';
import { requestsRouter } from './routes/requests';
import { ledgerRouter } from './routes/ledger';
import { documentsRouter } from './routes/documents';
import { dossierRouter } from './routes/dossier';
import { eventsRouter } from './routes/events';
import { healthRouter } from './routes/health';
import { docsRouter } from './routes/docs';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errors';
import { repository } from './repo';

export async function createExpressApp() {
  await repository.init();

  const app = express();
  app.use(express.json());

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/parcels', parcelsRouter);
  app.use('/api/layers', layersRouter);
  app.use('/api/requests', requestsRouter);
  app.use('/api/ledger', ledgerRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/dossier', dossierRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/health', healthRouter);
  app.use('/api/docs', docsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/selftest', adminRouter);

  // Global error handler
  app.use(errorHandler);

  return app;
}
