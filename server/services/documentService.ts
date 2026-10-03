import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { Request } from 'express';
import { DocumentRecord, UserRole } from '../../shared/types';
import { config } from '../config';
import { repository } from '../repo';
import { appendLedgerEntry } from './ledgerService';

// Ensure uploads directory exists on disk
if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

// Multer memory storage for magic-byte verification before writing to disk
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: config.maxUploadSizeBytes // 5 MB limit
  }
});

/**
 * Validates file buffer against statutory magic-byte signatures
 * Supports PDF (%PDF), PNG, JPEG (SOI marker)
 */
export function validateMagicBytes(buffer: Buffer): { valid: boolean; detectedMime?: string } {
  if (!buffer || buffer.length < 4) {
    return { valid: false };
  }

  // PDF: %PDF (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, detectedMime: 'application/pdf' };
  }

  // PNG: \x89PNG (0x89 0x50 0x4E 0x47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  return { valid: false };
}

/**
 * Ingests an uploaded file buffer, computes SHA-256, writes to disk, saves record and anchors in ledger
 */
export async function ingestDocument(params: {
  file: Express.Multer.File;
  parcelUlpin?: string;
  actor: {
    id: string;
    role: UserRole;
    fullName: string;
  };
}): Promise<DocumentRecord> {
  const magic = validateMagicBytes(params.file.buffer);
  if (!magic.valid) {
    throw new Error('Invalid file format. Only authentic PDF, PNG, and JPEG documents are permitted (magic bytes verification failed).');
  }

  const sha256Hash = crypto.createHash('sha256').update(params.file.buffer).digest('hex');
  const fileExt = path.extname(params.file.originalname) || (magic.detectedMime === 'application/pdf' ? '.pdf' : '.bin');
  const id = `DOC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const storedFilename = `${id}${fileExt}`;
  const diskPath = path.join(config.uploadsDir, storedFilename);

  // Write file to disk
  await fs.promises.writeFile(diskPath, params.file.buffer);

  const docRecord: DocumentRecord = {
    id,
    parcelUlpin: params.parcelUlpin,
    filename: storedFilename,
    originalName: params.file.originalname,
    mimeType: magic.detectedMime || params.file.mimetype,
    sizeBytes: params.file.buffer.length,
    sha256Hash,
    uploadedBy: params.actor.fullName,
    uploadedRole: params.actor.role,
    uploadedAt: new Date().toISOString(),
    filepath: diskPath
  };

  await repository.saveDocument(docRecord);

  // Anchor in immutable ledger
  await appendLedgerEntry({
    action: 'DOCUMENT_UPLOADED',
    actorRole: params.actor.role,
    actorName: params.actor.fullName,
    actorId: params.actor.id,
    ulpin: params.parcelUlpin,
    detail: `Document "${params.file.originalname}" (${(params.file.buffer.length / 1024).toFixed(1)} KB) uploaded. SHA-256 anchored: ${sha256Hash.slice(0, 16)}...`,
    payloadHash: sha256Hash,
    payload: {
      documentId: id,
      originalName: params.file.originalname,
      sha256Hash,
      mimeType: docRecord.mimeType,
      sizeBytes: docRecord.sizeBytes
    }
  });

  return docRecord;
}
