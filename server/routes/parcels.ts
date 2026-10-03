import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { repository } from '../repo';
import { serializeParcel } from '../services/serializers';
import { evaluateParcelRisks, summarizeRisks } from '../services/riskEngine';
import { appendLedgerEntry, shouldLogParcelView } from '../services/ledgerService';

export const parcelsRouter = Router();

const QuerySchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  disputed: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  flagged: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

// GET /api/parcels
parcelsRouter.get('/', requireAuth, validateQuery(QuerySchema), async (req: Request, res: Response) => {
  const filter = req.query as {
    q?: string;
    city?: string;
    disputed?: boolean;
    flagged?: boolean;
    page?: number;
    limit?: number;
  };

  const result = await repository.getParcels(filter);
  const role = req.user!.role;
  const allParcels = (await repository.getParcels({ limit: 100 })).items;
  const waterbodies = await repository.getWaterbodies();

  // Search and list endpoints expose counts and severity only
  const serializedItems = result.items.map(p => {
    const serialized = serializeParcel(p, role);
    const risks = evaluateParcelRisks(p, allParcels, waterbodies, role);
    const riskSummary = summarizeRisks(risks);
    return {
      ...serialized,
      riskSummary
    };
  });

  // Log PARCEL_SEARCH if query parameters provided
  if (filter.q || filter.city) {
    await appendLedgerEntry({
      action: 'PARCEL_SEARCH',
      actorRole: role,
      actorName: req.user!.fullName,
      actorId: req.user!.id,
      detail: `Cadastral spatial query executed: q="${filter.q || ''}", city="${filter.city || ''}". Returned ${result.total} parcels.`,
      payload: { query: filter.q, city: filter.city, count: result.total }
    });
  }

  res.json({
    success: true,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    data: serializedItems
  });
});

// GET /api/parcels/:ulpin
parcelsRouter.get('/:ulpin', requireAuth, async (req: Request, res: Response) => {
  const { ulpin } = req.params;
  const parcel = await repository.getParcelByUlpin(ulpin);

  if (!parcel) {
    res.status(404).json({
      success: false,
      error: { code: 'PARCEL_NOT_FOUND', message: `No parcel found with ULPIN: ${ulpin}` }
    });
    return;
  }

  const role = req.user!.role;
  const serialized = serializeParcel(parcel, role);

  // Debounced PARCEL_VIEW ledger logging (60 seconds per actor and parcel)
  if (shouldLogParcelView(req.user!.id, parcel.ulpin)) {
    await appendLedgerEntry({
      action: 'PARCEL_VIEW',
      actorRole: role,
      actorName: req.user!.fullName,
      actorId: req.user!.id,
      ulpin: parcel.ulpin,
      detail: `Parcel ${parcel.displayUlpin} (Survey ${parcel.surveyNumber}) viewed under ${role.toUpperCase()} session.`,
      payload: {
        ulpin: parcel.ulpin,
        surveyNumber: parcel.surveyNumber,
        district: parcel.district
      }
    });
  }

  res.json({
    success: true,
    data: serialized
  });
});

// GET /api/parcels/:ulpin/risks
parcelsRouter.get('/:ulpin/risks', requireAuth, async (req: Request, res: Response) => {
  const { ulpin } = req.params;
  const parcel = await repository.getParcelByUlpin(ulpin);

  if (!parcel) {
    res.status(404).json({
      success: false,
      error: { code: 'PARCEL_NOT_FOUND', message: `No parcel found with ULPIN: ${ulpin}` }
    });
    return;
  }

  const role = req.user!.role;
  const allResult = await repository.getParcels({ limit: 100 });
  const waterbodies = await repository.getWaterbodies();

  // Evaluates risk engine findings and automatically strips citizen evidence (R1 court details, R7 bank details)
  const findings = evaluateParcelRisks(parcel, allResult.items, waterbodies, role);
  const summary = summarizeRisks(findings);

  res.json({
    success: true,
    ulpin: parcel.ulpin,
    displayUlpin: parcel.displayUlpin,
    role,
    summary,
    findingsCount: findings.length,
    findings
  });
});
