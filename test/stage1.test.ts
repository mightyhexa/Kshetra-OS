import { generateUlpin, formatUlpin, cleanUlpin, isValidUlpin } from '../shared/ulpin';
import { serializeParcel, scanForForbiddenCitizenKeys } from '../server/services/serializers';
import { buildSeedDatabase } from '../server/repo/seed';
import { evaluateParcelRisks } from '../server/services/riskEngine';
import { verifyChain } from '../server/services/ledgerService';

async function runTests() {
  console.log('--- Running STAGE 1 Unit Tests ---');
  let failures = 0;

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failures++;
    } else {
      console.log(`✅ PASS: ${msg}`);
    }
  }

  // 1. Test ULPIN derivation and format
  const ulpin = generateUlpin('KA', 12.9818, 77.6205, '142/2A');
  assert(ulpin.length === 14, `ULPIN length is 14 characters (got ${ulpin.length}: ${ulpin})`);
  assert(ulpin.startsWith('KA'), `ULPIN starts with 2-letter state code KA`);
  assert(isValidUlpin(ulpin), `ULPIN matches standard 14-char regex`);
  const formatted = formatUlpin(ulpin);
  assert(/^[A-Z]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(formatted), `ULPIN formats as XX-XXXX-XXXX-XXXX (${formatted})`);
  assert(cleanUlpin(formatted) === ulpin, `cleanUlpin strips hyphens back to original`);

  // 2. Test Seed Database
  const db = buildSeedDatabase();
  assert(db.parcels.length === 26, `Exactly 26 parcels generated across 5 metros (got ${db.parcels.length})`);
  
  const metroCounts: Record<string, number> = {};
  db.parcels.forEach(p => { metroCounts[p.district] = (metroCounts[p.district] || 0) + 1; });
  assert(metroCounts['Bengaluru Urban'] === 6, 'Bengaluru has 6 parcels');
  assert(metroCounts['Hyderabad'] === 5, 'Hyderabad has 5 parcels');
  assert(metroCounts['Pune'] === 5, 'Pune has 5 parcels');
  assert(metroCounts['Lucknow'] === 5, 'Lucknow has 5 parcels');
  assert(metroCounts['Ahmedabad'] === 5, 'Ahmedabad has 5 parcels');

  // Verify all 26 parcels have valid 14-char ULPINs
  const allUlpinsValid = db.parcels.every(p => isValidUlpin(p.ulpin));
  assert(allUlpinsValid, 'All 26 parcels have valid 14-character Bhu-Aadhaar ULPINs');

  // 3. Test Role Masking & Deep Scan for Forbidden Keys
  const mortgagedParcel = db.parcels.find(p => p.encumbrance.hasMortgage)!;
  const disputedParcel = db.parcels.find(p => p.encumbrance.disputeFlag)!;
  
  const citizenSerialized = serializeParcel(mortgagedParcel, 'citizen');
  const violations = scanForForbiddenCitizenKeys(citizenSerialized);
  assert(violations.length === 0, `Citizen serialized parcel has zero forbidden keys (violations: ${violations.join(', ')})`);
  assert((citizenSerialized as any).encumbrance.mortgageDetails === undefined, 'mortgageDetails is physically absent for citizen');
  assert((citizenSerialized as any).ownership.coOwners === undefined, 'coOwners is physically absent for citizen');

  const citizenDisputed = serializeParcel(disputedParcel, 'citizen');
  assert((citizenDisputed as any).encumbrance.courtCaseNumber === undefined, 'courtCaseNumber is physically absent for citizen');
  assert((citizenDisputed as any).encumbrance.stayOrderDetails === undefined, 'stayOrderDetails is physically absent for citizen');

  const officerSerialized = serializeParcel(mortgagedParcel, 'officer');
  assert((officerSerialized as any).encumbrance.mortgageDetails !== undefined, 'mortgageDetails is present for officer');

  // 4. Test Scenarios evaluated by Risk Engine
  const allFlags = db.parcels.flatMap(p => evaluateParcelRisks(p, db.parcels, db.waterbodies));
  
  const severeOverlap = allFlags.find(f => f.code === 'CADASTRAL_OVERLAP_SEVERE');
  assert(!!severeOverlap, 'Found severe cadastral boundary overlap (> 5%)');

  const toleranceOverlap = allFlags.find(f => f.code === 'CADASTRAL_OVERLAP_TOLERANCE');
  assert(!!toleranceOverlap, 'Found boundary sliver within survey tolerance (0.1% - 1%)');

  const waterbodyFlags = allFlags.filter(f => f.code === 'WATERBODY_NGT_BUFFER_VIOLATION');
  assert(waterbodyFlags.length === 3, `Found exactly 3 parcels within 65m waterbody buffer (got ${waterbodyFlags.length})`);

  const stayOrderFlags = allFlags.filter(f => f.code === 'ACTIVE_STAY_ORDER_LITIGATION');
  assert(stayOrderFlags.length === 4, `Found exactly 4 parcels with active litigation and stay orders (got ${stayOrderFlags.length})`);

  const duplicateConveyance = allFlags.find(f => f.code === 'DUPLICATE_CONVEYANCE_90D');
  assert(!!duplicateConveyance, 'Found duplicate conveyance within 90 days');

  const cersaiLien = allFlags.find(f => f.code === 'CERSAI_UNDISCLOSED_MORTGAGE');
  assert(!!cersaiLien, 'Found CERSAI undisclosed mortgage discrepancy');

  const zoningMismatches = allFlags.filter(f => f.code === 'ZONING_MISMATCH');
  assert(zoningMismatches.length === 2, `Found exactly 2 zoning/land-use mismatches (got ${zoningMismatches.length})`);

  const staleTax = allFlags.find(f => f.code === 'STALE_TAX_DEFAULT');
  assert(!!staleTax, 'Found stale municipal property tax assessment');

  // 5. Test Ledger Chain Verification and Tamper Detection
  const verifyValid = verifyChain(db.ledger);
  assert(verifyValid.isValid === true, 'Pristine seed ledger passes cryptographic verification');

  // Tamper with block 1 in memory
  const tamperedLedger = JSON.parse(JSON.stringify(db.ledger));
  tamperedLedger[1].details = 'MALICIOUS_MODIFICATION_OF_REVENUE_ENTRY';
  const verifyTampered = verifyChain(tamperedLedger);
  assert(verifyTampered.isValid === false, 'Tampered ledger fails cryptographic verification');
  assert(verifyTampered.brokenBlockIndex === 1, 'Verification correctly pinpoints broken Block #1');

  // 6. Test SQLite Persistence Repository
  const sqliteRepo = new (await import('../server/repo/sqliteRepo')).SqliteRepository();
  await sqliteRepo.init();
  const sqliteParcels = await sqliteRepo.getParcels();
  assert(sqliteParcels.total === 26, `SQLite store persisted and retrieved 26 parcels (got ${sqliteParcels.total})`);
  const bngParcel = await sqliteRepo.getParcelByUlpin(sqliteParcels.items[0].ulpin);
  assert(bngParcel !== null, 'SQLite parcel fetch by ULPIN succeeded');
  assert(bngParcel?.ownership.ownerName !== undefined, 'SQLite joined ownership successfully');
  assert(bngParcel?.zoning.masterPlanClassification !== undefined, 'SQLite joined zoning successfully');

  if (failures > 0) {
    console.error(`\nTest suite finished with ${failures} failure(s).`);
    process.exit(1);
  } else {
    console.log('\nAll STAGE 1 unit tests passed successfully!\n');
  }
}

runTests();
