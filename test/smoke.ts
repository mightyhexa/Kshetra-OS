import { createExpressApp } from '../server/index';
import request from 'supertest';
import { repository } from '../server/repo';

async function main() {
  const app = await createExpressApp();
  await repository.resetToSeed();

  console.log('=== KSHETRA OS LIVE SMOKE TEST ===\n');

  // (a) Login as each role
  console.log('--- (a) Login as Each Role ---');
  const citizenLogin = await request(app).post('/api/auth/login').send({ role: 'citizen' });
  const citizenToken = citizenLogin.body.token;
  console.log('Citizen Login:', { status: citizenLogin.status, user: citizenLogin.body.user.fullName, role: citizenLogin.body.user.role, hasToken: !!citizenToken });

  const officerLogin = await request(app).post('/api/auth/login').send({ role: 'officer' });
  const officerToken = officerLogin.body.token;
  console.log('Officer Login:', { status: officerLogin.status, user: officerLogin.body.user.fullName, role: officerLogin.body.user.role, hasToken: !!officerToken });

  const adminLogin = await request(app).post('/api/auth/login').send({ role: 'policy_admin' });
  const adminToken = adminLogin.body.token;
  console.log('Admin Login:', { status: adminLogin.status, user: adminLogin.body.user.fullName, role: adminLogin.body.user.role, hasToken: !!adminToken });

  // Get a mortgaged parcel
  const allParcels = (await repository.getParcels({ limit: 50 })).items;
  const mortgaged = allParcels.find(p => p.encumbrance.hasMortgage)!;
  const targetUlpin = mortgaged.ulpin;

  // (b) Citizen GET /api/parcels/:ulpin
  console.log('\n--- (b) Citizen GET /api/parcels/:ulpin (Forbidden Keys Absent) ---');
  const citizenParcelRes = await request(app)
    .get(`/api/parcels/${targetUlpin}`)
    .set('Authorization', `Bearer ${citizenToken}`);
  const citizenData = citizenParcelRes.body.data;
  console.log('Citizen Parcel Data Sample:', {
    ulpin: citizenData.ulpin,
    ownerName: citizenData.ownership?.ownerName,
    coOwners: citizenData.ownership?.coOwners, // should be undefined
    hasMortgage: citizenData.encumbrance?.hasMortgage,
    mortgageDetails: citizenData.encumbrance?.mortgageDetails, // should be undefined
    courtCaseNumber: citizenData.encumbrance?.courtCaseNumber // should be undefined
  });

  // (c) Officer GET of the same parcel
  console.log('\n--- (c) Officer GET /api/parcels/:ulpin (Full Details Present) ---');
  const officerParcelRes = await request(app)
    .get(`/api/parcels/${targetUlpin}`)
    .set('Authorization', `Bearer ${officerToken}`);
  const officerData = officerParcelRes.body.data;
  console.log('Officer Parcel Data Sample:', {
    ulpin: officerData.ulpin,
    ownerName: officerData.ownership?.ownerName,
    coOwners: officerData.ownership?.coOwners,
    hasMortgage: officerData.encumbrance?.hasMortgage,
    mortgageDetails: officerData.encumbrance?.mortgageDetails,
    courtCaseNumber: officerData.encumbrance?.courtCaseNumber
  });

  // (d) Ledger verification, tamper-demo, reset
  console.log('\n--- (d) Ledger Verification, Tamper-Demo Overlay & Reset ---');
  const verify1 = await request(app)
    .get('/api/ledger/verify')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('1. Pristine Verify Result:', verify1.body);

  const tamperRes = await request(app)
    .post('/api/ledger/tamper-demo')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('2. Tamper Demo Applied:', tamperRes.body);

  const verify2 = await request(app)
    .get('/api/ledger/verify')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('3. Tampered Verify Result:', verify2.body);

  const resetRes = await request(app)
    .post('/api/ledger/tamper-reset')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('4. Tamper Reset:', resetRes.body);

  const verify3 = await request(app)
    .get('/api/ledger/verify')
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('5. Post-Reset Verify Result:', verify3.body);

  // (e) Invalid workflow transition returning 409
  console.log('\n--- (e) Workflow State Machine Transition Checks ---');
  const reqs = await repository.getServiceRequests();
  const sampleReq = reqs.find(r => r.status === 'Under Review') || reqs[0];
  console.log(`Testing Request ID: ${sampleReq.id}, Current Status: ${sampleReq.status}`);

  const invalidTransition = await request(app)
    .post(`/api/requests/${sampleReq.id}/transition`)
    .set('Authorization', `Bearer ${officerToken}`)
    .send({
      nextStatus: 'Applied', // Illegal backward jump from Under Review to Applied
      remarks: 'Attempting invalid backward transition'
    });
  console.log('Invalid Transition (Under Review -> Applied) [Expected 409]:', {
    status: invalidTransition.status,
    body: invalidTransition.body
  });

  const validTransition = await request(app)
    .post(`/api/requests/${sampleReq.id}/transition`)
    .set('Authorization', `Bearer ${officerToken}`)
    .send({
      nextStatus: 'Cross Verified',
      remarks: 'Field verification completed and joint survey verified.'
    });
  console.log('Valid Transition (Under Review -> Cross Verified) [Expected 200]:', {
    status: validTransition.status,
    newStatus: validTransition.body.data?.status
  });

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
