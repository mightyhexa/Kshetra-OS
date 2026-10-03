import { Parcel } from '../../../shared/types';
import { generateUlpin, formatUlpin } from '../../../shared/ulpin';
import { calculateArea } from '../../services/geo';

function makeLucknowParcel(data: {
  surveyNumber: string;
  lat: number;
  lon: number;
  subDistrict: string;
  villageWard: string;
  pinCode: string;
  polygon: number[][];
  ownerName: string;
  ownerGender: 'Male' | 'Female' | 'Joint' | 'Entity';
  ownershipType: 'Private Individual' | 'Joint Family' | 'Corporate' | 'Government';
  regDate: string;
  regNumber: string;
  sroOffice: string;
  stampDuty: number;
  marketValuation: number;
  coOwners?: string[];
  masterPlan: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural' | 'Public Utility';
  registeredUse: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural' | 'Public Utility';
  farAllowed: number;
  farUtilized: number;
  buildingStatus: 'Approved' | 'Violation Notice Issued' | 'Pending Review' | 'Exempt';
  hasMortgage: boolean;
  disputeFlag: boolean;
  stayOrderActive?: boolean;
  courtCase?: string;
  stayOrderDetails?: string;
  disputeReason?: string;
  mortgage?: { lender: string; amount: number; date: string; chargeId: string };
  taxAssessmentNo: string;
  taxDemand: number;
  taxStatus: 'Paid' | 'Outstanding';
  taxYear: number;
}): Parcel {
  const boundaryGeojson = { type: 'Polygon' as const, coordinates: [data.polygon] };
  const { areaSqm, areaAcres } = calculateArea(boundaryGeojson);
  const ulpin = generateUlpin('UP', data.lat, data.lon, data.surveyNumber);

  return {
    ulpin,
    displayUlpin: formatUlpin(ulpin),
    surveyNumber: data.surveyNumber,
    centroidLat: data.lat,
    centroidLon: data.lon,
    areaSqm,
    areaAcres,
    state: 'Uttar Pradesh',
    stateCode: 'UP',
    district: 'Lucknow',
    subDistrict: data.subDistrict,
    villageWard: data.villageWard,
    pinCode: data.pinCode,
    boundaryGeojson,
    ownership: {
      parcelUlpin: ulpin,
      ownerName: data.ownerName,
      ownerGender: data.ownerGender,
      ownershipType: data.ownershipType,
      registrationDate: data.regDate,
      registrationNumber: data.regNumber,
      subRegistrarOffice: data.sroOffice,
      stampDutyPaidInr: data.stampDuty,
      marketValuationInr: data.marketValuation,
      coOwners: data.coOwners
    },
    zoning: {
      parcelUlpin: ulpin,
      masterPlanClassification: data.masterPlan,
      registeredLandUse: data.registeredUse,
      floorAreaRatioAllowed: data.farAllowed,
      floorAreaRatioUtilized: data.farUtilized,
      buildingPermissionStatus: data.buildingStatus
    },
    encumbrance: {
      parcelUlpin: ulpin,
      hasMortgage: data.hasMortgage,
      disputeFlag: data.disputeFlag,
      stayOrderActive: data.stayOrderActive,
      stayOrderDetails: data.stayOrderDetails,
      courtCaseNumber: data.courtCase,
      disputeReason: data.disputeReason,
      mortgageDetails: data.mortgage ? {
        lenderName: data.mortgage.lender,
        loanAmountInr: data.mortgage.amount,
        sanctionDate: data.mortgage.date,
        chargeId: data.mortgage.chargeId,
        chargeStatus: 'Active'
      } : undefined
    },
    tax: {
      parcelUlpin: ulpin,
      propertyTaxAssessmentNo: data.taxAssessmentNo,
      annualTaxDemandInr: data.taxDemand,
      taxStatus: data.taxStatus,
      assessmentYear: data.taxYear
    }
  };
}

export const LUCKNOW_PARCELS: Parcel[] = [
  // UP-1: Active Court Litigation with Stay Order (Scenario 4 - Court 2)
  makeLucknowParcel({
    surveyNumber: '412/1',
    lat: 26.8520,
    lon: 80.9980,
    subDistrict: 'Lucknow Sadar',
    villageWard: 'Gomti Nagar Vibhuti Khand',
    pinCode: '226010',
    polygon: [
      [80.9970, 26.8512], [80.9990, 26.8512], [80.9990, 26.8528], [80.9970, 26.8528], [80.9970, 26.8512]
    ],
    ownerName: 'Awadh Real Estate Promoters Pvt Ltd',
    ownerGender: 'Entity',
    ownershipType: 'Corporate',
    regDate: '2020-02-18',
    regNumber: 'LKO-SDR/1029/2020',
    sroOffice: 'Sub-Registrar Sadar 2',
    stampDuty: 850000,
    marketValuation: 170000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 2.75,
    farUtilized: 2.6,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: true,
    stayOrderActive: true,
    courtCase: 'CS-LKO-401/2023',
    stayOrderDetails: 'Allahabad High Court (Lucknow Bench) interim stay order restraining third-party rights.',
    disputeReason: 'Writ petition alleging improper ceiling surplus allotment under ULCRA proceedings.',
    taxAssessmentNo: 'LMC/Z4/2026/04121',
    taxDemand: 145000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  // UP-2: Active Court Litigation with Stay Order (Scenario 4 - Court 3)
  makeLucknowParcel({
    surveyNumber: '89/5',
    lat: 26.8410,
    lon: 80.9420,
    subDistrict: 'Lucknow Sadar',
    villageWard: 'Hazratganj Ashok Marg',
    pinCode: '226001',
    polygon: [
      [80.9412, 26.8402], [80.9428, 26.8402], [80.9428, 26.8418], [80.9412, 26.8418], [80.9412, 26.8402]
    ],
    ownerName: 'Syed Mehdi Hasan',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2012-09-08',
    regNumber: 'LKO-SDR/4910/2012',
    sroOffice: 'Sub-Registrar Sadar 1',
    stampDuty: 340000,
    marketValuation: 68000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 2.5,
    farUtilized: 2.4,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: true,
    stayOrderActive: true,
    courtCase: 'TS-LKO-119/2022',
    stayOrderDetails: 'Waqf Tribunal status-quo order regarding mutawalli succession deed.',
    disputeReason: 'Title dispute before Shia Central Waqf Tribunal claiming Waqf dedicated property status.',
    taxAssessmentNo: 'LMC/Z1/2026/00895',
    taxDemand: 62000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  // UP-3: Zoning Mismatch: Master Plan = 'Commercial', Registered Land Use = 'Residential' (Scenario 7 - Zoning Mismatch 2)
  makeLucknowParcel({
    surveyNumber: '174/2',
    lat: 26.8820,
    lon: 80.9650,
    subDistrict: 'Lucknow Sadar',
    villageWard: 'Indira Nagar Sector 14',
    pinCode: '226016',
    polygon: [
      [80.9642, 26.8812], [80.9658, 26.8812], [80.9658, 26.8828], [80.9642, 26.8828], [80.9642, 26.8812]
    ],
    ownerName: 'Dr. Rameshwar Dayal Tiwari',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2019-10-14',
    regNumber: 'LKO-SDR/6211/2019',
    sroOffice: 'Sub-Registrar Sadar 3',
    stampDuty: 210000,
    marketValuation: 42000000,
    masterPlan: 'Commercial',
    registeredUse: 'Residential', // Inconsistency!
    farAllowed: 2.5,
    farUtilized: 2.2,
    buildingStatus: 'Violation Notice Issued',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'LMC/Z3/2026/01742',
    taxDemand: 28000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  // UP-4: Stale Tax Assessment (Outstanding arrears since 2022) (Scenario 8 - Stale Tax Assessment)
  makeLucknowParcel({
    surveyNumber: '290/3',
    lat: 26.8150,
    lon: 80.9120,
    subDistrict: 'Sarojini Nagar',
    villageWard: 'Alambagh Chander Nagar',
    pinCode: '226005',
    polygon: [
      [80.9112, 26.8142], [80.9128, 26.8142], [80.9128, 26.8158], [80.9112, 26.8158], [80.9112, 26.8142]
    ],
    ownerName: 'Jagdish Prasad Shukla',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2011-04-18',
    regNumber: 'LKO-SRJ/1908/2011',
    sroOffice: 'Sub-Registrar Sarojini Nagar',
    stampDuty: 160000,
    marketValuation: 32000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 1.75,
    farUtilized: 1.5,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'LMC/Z5/2026/02903',
    taxDemand: 42500,
    taxStatus: 'Outstanding', // Stale tax dues since 2022!
    taxYear: 2022
  }),
  makeLucknowParcel({
    surveyNumber: '61/1',
    lat: 26.8710,
    lon: 80.9520,
    subDistrict: 'Lucknow Sadar',
    villageWard: 'Mahanagar Sector B',
    pinCode: '226006',
    polygon: [
      [80.9512, 26.8702], [80.9528, 26.8702], [80.9528, 26.8718], [80.9512, 26.8718], [80.9512, 26.8702]
    ],
    ownerName: 'Shalini Srivastava',
    ownerGender: 'Female',
    ownershipType: 'Private Individual',
    regDate: '2023-05-30',
    regNumber: 'LKO-SDR/7802/2023',
    sroOffice: 'Sub-Registrar Sadar 1',
    stampDuty: 250000,
    marketValuation: 50000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.0,
    farUtilized: 1.8,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'LMC/Z3/2026/00611',
    taxDemand: 22000,
    taxStatus: 'Paid',
    taxYear: 2026
  })
];
