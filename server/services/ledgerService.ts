import crypto from 'crypto';
import { AuditLedgerEntry, LedgerAction, UserRole } from '../../shared/types';
import { repository } from '../repo';
import { eventBroadcaster } from './eventBroadcaster';

export const GENESIS_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// In-memory tamper overlay for tamper-demo and tamper-reset (disk/db is never damaged)
let inMemoryTamperOverlay: { index: number; alteredDetail: string } | null = null;

// Debounce map for PARCEL_VIEW (actorId:ulpin -> timestamp)
const viewDebounceMap = new Map<string, number>();

export function setTamperOverlay(index: number, alteredDetail: string): void {
  inMemoryTamperOverlay = { index, alteredDetail };
}

export function clearTamperOverlay(): void {
  inMemoryTamperOverlay = null;
}

export function getTamperOverlayState(): { active: boolean; targetIndex?: number } {
  return {
    active: inMemoryTamperOverlay !== null,
    targetIndex: inMemoryTamperOverlay?.index
  };
}

export function shouldLogParcelView(actorId: string, ulpin: string): boolean {
  const key = `${actorId}:${ulpin}`;
  const now = Date.now();
  const last = viewDebounceMap.get(key) || 0;
  if (now - last < 60_000) {
    return false;
  }
  viewDebounceMap.set(key, now);
  return true;
}

/**
 * Computes deterministic payload hash
 */
export function computePayloadHash(payload: unknown): string {
  if (typeof payload === 'string') {
    return crypto.createHash('sha256').update(payload).digest('hex');
  }
  const serialized = JSON.stringify(payload || {});
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Computes canonical SHA-256 hash over all block fields except hash, plus previousHash
 */
export function computeCanonicalBlockHash(
  index: number,
  timestamp: string,
  action: string,
  actorId: string,
  actorRole: string,
  ulpin: string | undefined,
  detail: string,
  payloadHash: string,
  previousHash: string
): string {
  // Canonical serialization: keys are strictly alphabetized
  const canonical = JSON.stringify({
    action,
    actorId,
    actorRole,
    detail,
    index,
    payloadHash,
    previousHash,
    timestamp,
    ulpin: ulpin || null
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Appends a verified cryptographic block to the persistent ledger
 */
export async function appendLedgerEntry(params: {
  action: LedgerAction;
  actorRole: UserRole;
  actorName: string;
  actorId: string;
  detail: string;
  ulpin?: string;
  payload?: unknown;
  payloadHash?: string;
}): Promise<AuditLedgerEntry> {
  const existing = await repository.getLedgerBlocks();
  const index = existing.length;
  const previousHash = index === 0 ? GENESIS_PREV_HASH : existing[index - 1].currentHash;
  const timestamp = new Date().toISOString();
  const payloadHash = params.payloadHash || computePayloadHash(params.payload);

  const hash = computeCanonicalBlockHash(
    index,
    timestamp,
    params.action,
    params.actorId,
    params.actorRole,
    params.ulpin,
    params.detail,
    payloadHash,
    previousHash
  );

  const block: AuditLedgerEntry = {
    blockIndex: index,
    timestamp,
    action: params.action,
    actorRole: params.actorRole,
    actorName: params.actorName,
    actorId: params.actorId,
    parcelUlpin: params.ulpin,
    details: params.detail,
    metadataPayload: {
      payloadHash,
      data: params.payload
    },
    previousHash,
    currentHash: hash
  };

  await repository.appendLedgerBlock(block);

  // Broadcast new block via Server-Sent Events
  eventBroadcaster.broadcast('LEDGER_BLOCK', {
    index: block.blockIndex,
    action: block.action,
    hash: block.currentHash,
    actorRole: block.actorRole,
    timestamp: block.timestamp,
    detail: block.details
  });

  return block;
}

/**
 * Computes canonical block hash for seed generator and existing callers
 */
export function computeBlockHash(
  blockIndex: number,
  timestamp: string,
  action: string,
  actorRole: UserRole,
  actorId: string,
  parcelUlpin: string | undefined,
  details: string,
  metadataPayload: Record<string, unknown>,
  previousHash: string
): string {
  const payloadHash = (metadataPayload as any)?.payloadHash || computePayloadHash(metadataPayload);
  return computeCanonicalBlockHash(
    blockIndex,
    timestamp,
    action,
    actorId,
    actorRole,
    parcelUlpin,
    details,
    payloadHash,
    previousHash
  );
}

/**
 * Compatibility builder for existing callers
 */
export function createLedgerBlock(
  blockIndex: number,
  action: AuditLedgerEntry['action'],
  actorRole: UserRole,
  actorName: string,
  actorId: string,
  details: string,
  parcelUlpin: string | undefined,
  metadataPayload: Record<string, unknown>,
  previousHash: string
): AuditLedgerEntry {
  const timestamp = new Date().toISOString();
  const payloadHash = computePayloadHash(metadataPayload);
  const currentHash = computeCanonicalBlockHash(
    blockIndex,
    timestamp,
    action,
    actorId,
    actorRole,
    parcelUlpin,
    details,
    payloadHash,
    previousHash
  );

  return {
    blockIndex,
    timestamp,
    action,
    actorRole,
    actorName,
    actorId,
    parcelUlpin,
    details,
    metadataPayload: {
      ...metadataPayload,
      payloadHash
    },
    previousHash,
    currentHash
  };
}

export interface VerificationResult {
  valid: boolean;
  isValid: boolean;
  checked: number;
  verifiedBlocks: number;
  firstBrokenIndex?: number;
  brokenBlockIndex?: number;
  reason?: string;
  errorReason?: string;
  timestamp: string;
}

/**
 * Recomputes EVERY block hash and link pointer.
 * Detects any tampering or link break down to the exact block index.
 */
export function verifyChain(blocks: AuditLedgerEntry[]): VerificationResult {
  const timestamp = new Date().toISOString();
  if (!blocks || blocks.length === 0) {
    return { valid: true, isValid: true, checked: 0, verifiedBlocks: 0, timestamp };
  }

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const index = b.blockIndex ?? (b as any).index ?? i;

    // 1. Check link continuity pointer
    if (i === 0) {
      if (b.previousHash !== GENESIS_PREV_HASH) {
        return {
          valid: false,
          isValid: false,
          checked: 0,
          verifiedBlocks: 0,
          firstBrokenIndex: 0,
          brokenBlockIndex: 0,
          reason: 'Genesis Block #0 corrupted: previousHash must be 64 zeros.',
          errorReason: 'Genesis Block #0 corrupted: previousHash must be 64 zeros.',
          timestamp
        };
      }
    } else {
      const prev = blocks[i - 1];
      const prevHash = prev.currentHash ?? (prev as any).hash;
      if (b.previousHash !== prevHash) {
        const msg = `Block #${index} pointer broken: previousHash does not match Block #${i - 1} hash.`;
        return {
          valid: false,
          isValid: false,
          checked: i,
          verifiedBlocks: i,
          firstBrokenIndex: index,
          brokenBlockIndex: index,
          reason: msg,
          errorReason: msg,
          timestamp
        };
      }
    }

    // 2. Extract payload hash
    const meta = b.metadataPayload as any;
    const payloadHash = meta?.payloadHash || (b as any).payloadHash || computePayloadHash(meta || {});
    const detail = b.details ?? (b as any).detail ?? '';

    // 3. Recompute canonical hash
    const expectedHash = computeCanonicalBlockHash(
      index,
      b.timestamp,
      b.action,
      b.actorId,
      b.actorRole,
      b.parcelUlpin ?? (b as any).ulpin,
      detail,
      payloadHash,
      b.previousHash
    );

    const actualHash = b.currentHash ?? (b as any).hash;

    if (actualHash !== expectedHash) {
      const msg = `Cryptographic tamper detected at Block #${index}: stored hash (${actualHash.slice(0, 10)}...) does not match recalculated digest (${expectedHash.slice(0, 10)}...).`;
      return {
        valid: false,
        isValid: false,
        checked: i,
        verifiedBlocks: i,
        firstBrokenIndex: index,
        brokenBlockIndex: index,
        reason: msg,
        errorReason: msg,
        timestamp
      };
    }
  }

  return {
    valid: true,
    isValid: true,
    checked: blocks.length,
    verifiedBlocks: blocks.length,
    timestamp
  };
}

/**
 * Returns ledger blocks with in-memory tamper overlay applied if active
 */
export async function getEffectiveLedgerBlocks(): Promise<AuditLedgerEntry[]> {
  const blocks = await repository.getLedgerBlocks();
  const cloned: AuditLedgerEntry[] = JSON.parse(JSON.stringify(blocks));

  if (inMemoryTamperOverlay) {
    const target = cloned.find(b => b.blockIndex === inMemoryTamperOverlay!.index);
    if (target) {
      target.details = inMemoryTamperOverlay.alteredDetail;
      (target as any).detail = inMemoryTamperOverlay.alteredDetail;
      // Intentionally do NOT recalculate currentHash to manifest verification failure!
    }
  }

  return cloned;
}
