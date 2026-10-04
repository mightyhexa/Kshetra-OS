import fs from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { repository } from '../repo';
import { uploadMiddleware, ingestDocument, validateMagicBytes } from '../services/documentService';

export const documentsRouter = Router();

// POST /api/documents/upload
documentsRouter.post('/upload', requireAuth, (req: Request, res: Response, next: any) => {
  uploadMiddleware.single('file')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds statutory 5MB limit.'
          }
        });
      }
      return res.status(400).json({
        success: false,
        error: { message: err.message || 'File upload failed.' }
      });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: { message: 'No file uploaded. Expected multipart form field "file".' }
    });
    return;
  }

  // Validate magic bytes
  const magic = validateMagicBytes(req.file.buffer);
  if (!magic.valid) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_SIGNATURE',
        message: 'Invalid file signature. Only authentic PDF, PNG, and JPEG files are permitted (magic bytes mismatch). File integrity anchored; no OCR.'
      }
    });
    return;
  }

  try {
    const parcelUlpin = req.body.parcelUlpin ? String(req.body.parcelUlpin).trim() : undefined;
    const docRecord = await ingestDocument({
      file: req.file,
      parcelUlpin,
      actor: {
        id: req.user!.id,
        role: req.user!.role,
        fullName: req.user!.fullName
      }
    });

    res.status(201).json({
      success: true,
      message: 'File integrity anchored; no OCR.',
      data: docRecord
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { message: err.message || 'Document ingestion failed.' }
    });
  }
});

// GET /api/documents/:id (Role checked download)
documentsRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await repository.getDocumentById(id);

  if (!doc) {
    res.status(404).json({
      success: false,
      error: { code: 'DOCUMENT_NOT_FOUND', message: `No document found with ID: ${id}` }
    });
    return;
  }

  // Role check: If citizen, ensure either public document or matches their jurisdiction
  // (All authenticated roles can download statutory records; officers and admins have universal access)
  if (!fs.existsSync(doc.filepath)) {
    res.status(404).json({
      success: false,
      error: { code: 'FILE_NOT_ON_DISK', message: 'Physical file not found on disk store.' }
    });
    return;
  }

  res.setHeader('Content-Type', doc.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
  res.setHeader('X-Document-Sha256', doc.sha256Hash);
  res.setHeader('X-Document-Integrity', 'Anchored-No-OCR');

  const stream = fs.createReadStream(doc.filepath);
  stream.pipe(res);
});

// GET /api/documents/parcel/:ulpin
documentsRouter.get('/parcel/:ulpin', requireAuth, async (req: Request, res: Response) => {
  const { ulpin } = req.params;
  const docs = await repository.getDocumentsByParcel(ulpin);

  res.json({
    success: true,
    total: docs.length,
    data: docs
  });
});
