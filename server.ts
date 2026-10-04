import path from 'path';
import fs from 'fs';
import express from 'express';
import { createExpressApp } from './server/index';
import { config } from './server/config';

async function startServer() {
  const app = await createExpressApp();

  const distPath = path.resolve(process.cwd(), 'dist');
  const distExists = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (distExists && process.env.NODE_ENV !== 'development');

  if (isProduction && distExists) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[KSHETRA OS] Serving production static bundle from dist/');
  } else {
    // Development mode: Mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[KSHETRA OS] Full-stack Server listening on http://0.0.0.0:${config.port}`);
    console.log(`[KSHETRA OS] Mode: ${isProduction ? 'production' : 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('[KSHETRA OS] Server startup failed:', err);
  process.exit(1);
});
