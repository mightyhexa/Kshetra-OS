import path from 'path';
import express from 'express';
import { createExpressApp } from './server/index';
import { config } from './server/config';

async function startServer() {
  const app = await createExpressApp();

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
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
    console.log(`[KSHETRA OS] Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch((err) => {
  console.error('[KSHETRA OS] Server startup failed:', err);
  process.exit(1);
});
