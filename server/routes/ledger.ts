import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { 
  getEffectiveLedgerBlocks, 
  verifyChain, 
  setTamperOverlay, 
  clearTamperOverlay, 
  getTamperOverlayState 
} from '../services/ledgerService';
import { serializeLedgerBlock } from '../services/serializers';

export const ledgerRouter = Router();

// GET /api/ledger?filter=&page=&limit=
ledgerRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const filter = (req.query.filter as string || '').toLowerCase();
  const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string || '50', 10)));

  const allBlocks = await getEffectiveLedgerBlocks();
  
  let filtered = allBlocks;
  if (filter) {
    filtered = allBlocks.filter(b => 
      b.action.toLowerCase().includes(filter) ||
      b.details.toLowerCase().includes(filter) ||
      (b.parcelUlpin && b.parcelUlpin.toLowerCase().includes(filter)) ||
      b.actorRole.toLowerCase().includes(filter)
    );
  }

  const role = req.user!.role;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit).map(b => serializeLedgerBlock(b, role));

  res.json({
    success: true,
    total,
    page,
    totalPages,
    tamperSimulationActive: getTamperOverlayState().active,
    data: paginated
  });
});

// GET /api/ledger/verify & POST /api/ledger/verify
const handleVerify = async (req: Request, res: Response) => {
  const blocks = await getEffectiveLedgerBlocks();
  const result = verifyChain(blocks);

  res.json({
    success: true,
    valid: result.valid,
    checked: result.checked,
    firstBrokenIndex: result.firstBrokenIndex,
    reason: result.reason,
    timestamp: result.timestamp,
    tamperSimulationActive: getTamperOverlayState().active,
    data: result,
    result // backward compatibility with client
  });
};

ledgerRouter.get('/verify', requireAuth, handleVerify);
ledgerRouter.post('/verify', requireAuth, handleVerify);

// POST /api/ledger/tamper-demo (Policy Admin only)
const handleTamperDemo = async (req: Request, res: Response) => {
  const blocks = await getEffectiveLedgerBlocks();
  if (blocks.length < 2) {
    res.status(400).json({ success: false, error: { message: 'Not enough blocks to tamper' } });
    return;
  }

  const targetIndex = 1;
  const original = blocks[targetIndex].details;
  const tamperedDetails = `[MALICIOUS_OVERLAY_TAMPER] ${original} -- TITLE ALIENATION UNAUTHORIZED MUTATION`;

  setTamperOverlay(targetIndex, tamperedDetails);

  res.json({
    success: true,
    tampered: true,
    tamperedBlockIndex: targetIndex,
    message: `In-memory tamper overlay applied to Block #${targetIndex}. Storage remains untouched. Cryptographic verification will now immediately fail and identify Block #${targetIndex}.`
  });
};

ledgerRouter.post('/tamper-demo', requireAuth, requireRole(['policy_admin']), handleTamperDemo);
ledgerRouter.post('/tamper', requireAuth, requireRole(['policy_admin']), handleTamperDemo); // alias for UI convenience

// POST /api/ledger/tamper-reset
const handleTamperReset = async (req: Request, res: Response) => {
  clearTamperOverlay();
  res.json({
    success: true,
    tampered: false,
    message: 'In-memory tamper overlay cleared. Ledger is verified intact.'
  });
};

ledgerRouter.post('/tamper-reset', requireAuth, requireRole(['policy_admin']), handleTamperReset);
ledgerRouter.post('/reset', requireAuth, requireRole(['policy_admin']), handleTamperReset); // alias for UI convenience

// GET /api/ledger/export
ledgerRouter.get('/export', requireAuth, async (req: Request, res: Response) => {
  const blocks = await getEffectiveLedgerBlocks();
  const verification = verifyChain(blocks);

  const exportPayload = {
    metadata: {
      standard: 'KSHETRA OS SHA-256 Cadastral Audit Ledger',
      sihProblemStatement: 'SIH26014',
      exportedAt: new Date().toISOString(),
      exportedBy: req.user!.fullName,
      exportedRole: req.user!.role,
      totalBlocks: blocks.length,
      verificationStatus: verification.valid ? 'VALID_PRISTINE' : 'CORRUPTED_FAIL'
    },
    verification,
    chain: blocks
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="kshetra-ledger-export-${Date.now()}.json"`);
  res.json(exportPayload);
});
