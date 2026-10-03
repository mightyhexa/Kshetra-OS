import { AuditLedgerEntry, Parcel, ServiceRequest, UserPersona, WaterbodyRecord } from '../../shared/types';
import { PERSONAS } from '../../shared/roles';
import { BENGALURU_PARCELS } from './seedData/bengaluru';
import { HYDERABAD_PARCELS } from './seedData/hyderabad';
import { PUNE_PARCELS } from './seedData/pune';
import { LUCKNOW_PARCELS } from './seedData/lucknow';
import { AHMEDABAD_PARCELS } from './seedData/ahmedabad';
import { WATERBODIES } from './seedData/waterbodies';
import { generateSeedLedger, generateSeedRequests } from './seedData/requestsAndLedger';

export interface DatabaseState {
  version: string;
  seededAt: string;
  users: UserPersona[];
  parcels: Parcel[];
  waterbodies: WaterbodyRecord[];
  requests: ServiceRequest[];
  ledger: AuditLedgerEntry[];
}

export function buildSeedDatabase(): DatabaseState {
  const parcels: Parcel[] = [
    ...BENGALURU_PARCELS,
    ...HYDERABAD_PARCELS,
    ...PUNE_PARCELS,
    ...LUCKNOW_PARCELS,
    ...AHMEDABAD_PARCELS
  ];

  const users: UserPersona[] = Object.values(PERSONAS);
  const requests = generateSeedRequests(parcels);
  const ledger = generateSeedLedger(parcels);

  return {
    version: '2026.1.0',
    seededAt: new Date().toISOString(),
    users,
    parcels,
    waterbodies: WATERBODIES,
    requests,
    ledger
  };
}
