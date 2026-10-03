import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { repository } from '../repo';
import { generateDossierPdf, verifyDossierPdf } from '../services/dossierService';
import { uploadMiddleware } from '../services/documentService';

export const dossierRouter = Router();

// Handler for generating and serving official Cadastral Dossier PDF
const handleGenerateDossier = async (req: Request, res: Response) => {
  const { ulpin } = req.params;
  const parcel = await repository.getParcelByUlpin(ulpin);

  if (!parcel) {
    res.status(404).json({
      success: false,
      error: { code: 'PARCEL_NOT_FOUND', message: `No parcel found with ULPIN: ${ulpin}` }
    });
    return;
  }

  try {
    const dossier = await generateDossierPdf({
      parcel,
      actor: {
        id: req.user!.id,
        role: req.user!.role,
        fullName: req.user!.fullName
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="KSHETRA_Dossier_${parcel.displayUlpin}_${dossier.documentId}.pdf"`);
    res.setHeader('X-Dossier-Document-Id', dossier.documentId);
    res.setHeader('X-Dossier-Sha256', dossier.pdfHash);
    res.setHeader('X-Dossier-Role', dossier.role);
    res.setHeader('Content-Length', dossier.pdfBuffer.length);

    res.send(dossier.pdfBuffer);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to generate cadastral dossier PDF' }
    });
  }
};

// POST /api/dossier/verify (must precede parameterized /:ulpin route!)
// Accepts uploaded PDF and checks if hash matches a recorded DOSSIER_ISSUED ledger block
dossierRouter.post('/verify', requireAuth, uploadMiddleware.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: { message: 'PDF file is required in multipart field "file".' }
    });
    return;
  }

  try {
    const result = await verifyDossierPdf(req.file.buffer);

    res.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { message: err.message || 'Failed to verify dossier PDF cryptographic hash' }
    });
  }
});

// POST /api/dossier/:ulpin & GET /api/dossier/:ulpin
dossierRouter.post('/:ulpin', requireAuth, handleGenerateDossier);
dossierRouter.get('/:ulpin', requireAuth, handleGenerateDossier);

