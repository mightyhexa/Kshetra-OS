import { AuditLedgerEntry, ServiceRequest } from '../../../shared/types';
import { GENESIS_PREV_HASH, computeBlockHash } from '../../services/ledgerService';

/**
 * Generates initial service requests with timestamps relative to server boot (e.g. now - N days)
 */
export function generateSeedRequests(parcels: { ulpin: string; displayUlpin: string }[]): ServiceRequest[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const req1Time = new Date(now - 8 * dayMs).toISOString();
  const req1Review = new Date(now - 6 * dayMs).toISOString();
  const req1Verified = new Date(now - 3 * dayMs).toISOString();

  const req2Time = new Date(now - 5 * dayMs).toISOString();
  const req2Review = new Date(now - 4 * dayMs).toISOString();
  const req2Approved = new Date(now - 2 * dayMs).toISOString();

  const req3Time = new Date(now - 2 * dayMs).toISOString();
  const req3Review = new Date(now - 1 * dayMs).toISOString();

  return [
    {
      id: 'REQ-2026-0001',
      parcelUlpin: parcels[0]?.ulpin || 'KA000000000001',
      applicantName: 'Venkata Ramanappa Gowda',
      applicantAadhaarMasked: 'XXXX-XXXX-9182',
      requestType: 'MUTATION_OF_TITLE',
      status: 'CROSS_VERIFIED',
      submittedAt: req1Time,
      lastUpdatedAt: req1Verified,
      urgency: 'Normal',
      supportingDocName: 'Registered_SaleDeed_4102.pdf',
      history: [
        {
          id: 'TR-101',
          fromStatus: null,
          toStatus: 'SUBMITTED',
          department: 'Applicant',
          actionedByRole: 'citizen',
          actionedByName: 'Venkata Ramanappa Gowda',
          timestamp: req1Time,
          remarks: 'Application submitted along with registered sale deed copy.'
        },
        {
          id: 'TR-102',
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          department: 'Land Records & Survey',
          actionedByRole: 'officer',
          actionedByName: 'Anil Kumar Sharma (Tahsildar)',
          timestamp: req1Review,
          remarks: 'Survey bounds verified against Village Cadastral Map Sheet 142.'
        },
        {
          id: 'TR-103',
          fromStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          toStatus: 'CROSS_VERIFIED',
          department: 'Sub-Registrar (Stamps)',
          actionedByRole: 'officer',
          actionedByName: 'SRO Shivajinagar Verification Node',
          timestamp: req1Verified,
          remarks: 'E-Stamps authenticity confirmed; Revenue dues clear.'
        }
      ]
    },
    {
      id: 'REQ-2026-0002',
      parcelUlpin: parcels[6]?.ulpin || 'TS000000000002',
      applicantName: 'Venkata Satyanarayana Raju',
      applicantAadhaarMasked: 'XXXX-XXXX-3819',
      requestType: 'ENCUMBRANCE_CERTIFICATE',
      status: 'APPROVED',
      submittedAt: req2Time,
      lastUpdatedAt: req2Approved,
      urgency: 'Tatkal',
      supportingDocName: 'Form_22_EC_Application.pdf',
      history: [
        {
          id: 'TR-201',
          fromStatus: null,
          toStatus: 'SUBMITTED',
          department: 'Applicant',
          actionedByRole: 'citizen',
          actionedByName: 'Venkata Satyanarayana Raju',
          timestamp: req2Time,
          remarks: 'Tatkal request for 30-year Form 15 Encumbrance Certificate.'
        },
        {
          id: 'TR-202',
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          department: 'Sub-Registrar (Stamps)',
          actionedByRole: 'officer',
          actionedByName: 'Sub-Registrar Serilingampally',
          timestamp: req2Review,
          remarks: '30-year search executed across SRO volume books.'
        },
        {
          id: 'TR-203',
          fromStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          toStatus: 'APPROVED',
          department: 'Sub-Registrar (Stamps)',
          actionedByRole: 'officer',
          actionedByName: 'Sub-Registrar Serilingampally',
          timestamp: req2Approved,
          remarks: 'Nil Encumbrance Certificate Form 15 issued digitally.'
        }
      ]
    },
    {
      id: 'REQ-2026-0003',
      parcelUlpin: parcels[11]?.ulpin || 'MH000000000003',
      applicantName: 'Dattatray Bhaskar Kadam',
      applicantAadhaarMasked: 'XXXX-XXXX-5512',
      requestType: 'CADASTRAL_DEMARCATION',
      status: 'UNDER_DEPARTMENTAL_REVIEW',
      submittedAt: req3Time,
      lastUpdatedAt: req3Review,
      urgency: 'Normal',
      supportingDocName: 'Village_Form_7_12.pdf',
      history: [
        {
          id: 'TR-301',
          fromStatus: null,
          toStatus: 'SUBMITTED',
          department: 'Applicant',
          actionedByRole: 'citizen',
          actionedByName: 'Dattatray Bhaskar Kadam',
          timestamp: req3Time,
          remarks: 'Joint measurement survey request for boundary demarcation.'
        },
        {
          id: 'TR-302',
          fromStatus: 'SUBMITTED',
          toStatus: 'UNDER_DEPARTMENTAL_REVIEW',
          department: 'Land Records & Survey',
          actionedByRole: 'officer',
          actionedByName: 'Cadastral Surveyor Haveli',
          timestamp: req3Review,
          remarks: 'Notice issued to adjacent landholders for on-site DGPS demarcation.'
        }
      ]
    }
  ];
}

/**
 * Initializes the cryptographic SHA-256 audit ledger from Genesis block 0
 */
export function generateSeedLedger(parcels: { ulpin: string; displayUlpin: string }[]): AuditLedgerEntry[] {
  const blocks: AuditLedgerEntry[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Block 0: Genesis
  const genesisTime = new Date(now - 14 * dayMs).toISOString();
  const genesisPayload = {
    standard: 'SIH26014-DPI-GENESIS',
    spec: 'ULPIN-OGC-EPSG4326',
    authoritativeNode: 'National Land Governance Network'
  };
  const genesisHash = computeBlockHash(
    0,
    genesisTime,
    'ROLE_SWITCH',
    'policy_admin',
    'SYS-ROOT-001',
    undefined,
    'Genesis block initialized for KSHETRA OS National Spatial Data Infrastructure',
    genesisPayload,
    GENESIS_PREV_HASH
  );

  blocks.push({
    blockIndex: 0,
    timestamp: genesisTime,
    action: 'ROLE_SWITCH',
    actorRole: 'policy_admin',
    actorName: 'System Genesis Validator',
    actorId: 'SYS-ROOT-001',
    details: 'Genesis block initialized for KSHETRA OS National Spatial Data Infrastructure',
    metadataPayload: genesisPayload,
    previousHash: GENESIS_PREV_HASH,
    currentHash: genesisHash
  });

  // Block 1: Cadastral Indexing Event
  const t1 = new Date(now - 10 * dayMs).toISOString();
  const p1 = parcels[0]?.ulpin || 'KA000000000001';
  const h1 = computeBlockHash(
    1,
    t1,
    'PARCEL_SEARCH',
    'officer',
    'OFFICER-KA-09',
    p1,
    'Cadastral resolution query for Indiranagar Survey 142/2A',
    { query: '142/2A', district: 'Bengaluru Urban' },
    blocks[0].currentHash
  );

  blocks.push({
    blockIndex: 1,
    timestamp: t1,
    action: 'PARCEL_SEARCH',
    actorRole: 'officer',
    actorName: 'Anil Kumar Sharma (Land Officer)',
    actorId: 'OFFICER-KA-09',
    parcelUlpin: p1,
    details: 'Cadastral resolution query for Indiranagar Survey 142/2A',
    metadataPayload: { query: '142/2A', district: 'Bengaluru Urban' },
    previousHash: blocks[0].currentHash,
    currentHash: h1
  });

  // Block 2: Title Mutation Request
  const t2 = new Date(now - 8 * dayMs).toISOString();
  const h2 = computeBlockHash(
    2,
    t2,
    'SERVICE_REQUEST_SUBMIT',
    'citizen',
    'CITIZEN-KA-118',
    p1,
    'Online Title Mutation request lodged under REQ-2026-0001',
    { requestId: 'REQ-2026-0001', requestType: 'MUTATION_OF_TITLE', feePaidInr: 500 },
    blocks[1].currentHash
  );

  blocks.push({
    blockIndex: 2,
    timestamp: t2,
    action: 'SERVICE_REQUEST_SUBMIT',
    actorRole: 'citizen',
    actorName: 'Venkata Ramanappa Gowda',
    actorId: 'CITIZEN-KA-118',
    parcelUlpin: p1,
    details: 'Online Title Mutation request lodged under REQ-2026-0001',
    metadataPayload: { requestId: 'REQ-2026-0001', requestType: 'MUTATION_OF_TITLE', feePaidInr: 500 },
    previousHash: blocks[1].currentHash,
    currentHash: h2
  });

  return blocks;
}
