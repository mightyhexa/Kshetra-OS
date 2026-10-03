import { Router, Request, Response } from 'express';

export const docsRouter = Router();

// GET /api/docs (No auth required)
docsRouter.get('/', (req: Request, res: Response) => {
  res.json({
    title: 'KSHETRA OS Unified Land Governance API',
    version: '2026.1.0',
    description: 'REST API endpoints for SIH26014 Digital Public Infrastructure for Land Governance.',
    auth: {
      type: 'Bearer JWT',
      header: 'Authorization: Bearer <token>',
      endpoints: {
        login: 'POST /api/auth/login',
        otpRequest: 'POST /api/auth/otp/request',
        otpVerify: 'POST /api/auth/otp/verify',
        sso: 'POST /api/auth/sso',
        me: 'GET /api/auth/me'
      }
    },
    endpoints: [
      {
        path: '/api/parcels',
        method: 'GET',
        description: 'Search parcels with filters (q, city, disputed, flagged, page, limit). Result is role-masked.',
        authRequired: true
      },
      {
        path: '/api/parcels/:ulpin',
        method: 'GET',
        description: 'Get full cadastral record for a specific ULPIN. Sensitive banking/judicial fields physically omitted for Citizens.',
        authRequired: true
      },
      {
        path: '/api/parcels/:ulpin/risks',
        method: 'GET',
        description: 'Evaluate explainable cadastral risk flags (encroachments, waterbody buffers, stay orders, dual conveyances, CERSAI discrepancies).',
        authRequired: true
      },
      {
        path: '/api/layers/waterbodies',
        method: 'GET',
        description: 'Get statutory waterbody restriction polygons (lakes, stormwater drains) with 65m buffer zones.',
        authRequired: true
      },
      {
        path: '/api/health',
        method: 'GET',
        description: 'System health check.',
        authRequired: false
      }
    ]
  });
});
