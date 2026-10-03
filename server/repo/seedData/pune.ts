import { Parcel } from '../../../shared/types';
import { generateUlpin, formatUlpin } from '../../../shared/ulpin';
import { calculateArea } from '../../services/geo';

function makePuneParcel(data: {
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
  const ulpin = generateUlpin('MH', data.lat, data.lon, data.surveyNumber);

  return {
    ulpin,
    displayUlpin: formatUlpin(ulpin),
    surveyNumber: data.surveyNumber,
    centroidLat: data.lat,
    centroidLon: data.lon,
    areaSqm,
    areaAcres,
    state: 'Maharashtra',
    stateCode: 'MH',
    district: 'Pune',
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

export const PUNE_PARCELS: Parcel[] = [
  // MH-1 and MH-2: 7.2% MUTUAL POLYGON OVERLAP (Severe Cadastral Encroachment)
  makePuneParcel({
    surveyNumber: '67/2A',
    lat: 18.5204,
    lon: 73.8490,
    subDistrict: 'Haveli',
    villageWard: 'Shivajinagar Gaothan',
    pinCode: '411005',
    // Polygon A: 73.8480 to 73.8498
    polygon: [
      [73.8480, 18.5195], [73.8498, 18.5195], [73.8498, 18.5212], [73.8480, 18.5212], [73.8480, 18.5195]
    ],
    ownerName: 'Dattatray Bhaskar Kadam',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2016-05-14',
    regNumber: 'PUN-HVL/3012/2016',
    sroOffice: 'Sub-Registrar Haveli 1',
    stampDuty: 260000,
    marketValuation: 52000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.0,
    farUtilized: 1.8,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'PMC/HVL/2026/0672A',
    taxDemand: 28000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makePuneParcel({
    surveyNumber: '67/2B',
    lat: 18.5204,
    lon: 73.8505,
    subDistrict: 'Haveli',
    villageWard: 'Shivajinagar Gaothan',
    pinCode: '411005',
    // Polygon B: Overlaps Polygon A from 73.8492 to 73.8498 (~7.2% overlap)
    polygon: [
      [73.8492, 18.5195], [73.8512, 18.5195], [73.8512, 18.5212], [73.8492, 18.5212], [73.8492, 18.5195]
    ],
    ownerName: 'Sunil Mahadev Jadhav',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2018-11-20',
    regNumber: 'PUN-HVL/7721/2018',
    sroOffice: 'Sub-Registrar Haveli 1',
    stampDuty: 280000,
    marketValuation: 56000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.0,
    farUtilized: 1.9,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'PMC/HVL/2026/0672B',
    taxDemand: 31000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  // MH-3: Active court litigation with stay order (Scenario 4 - Court 1)
  makePuneParcel({
    surveyNumber: '118/4',
    lat: 18.5080,
    lon: 73.8070,
    subDistrict: 'Haveli',
    villageWard: 'Kothrud Paud Road',
    pinCode: '411038',
    polygon: [
      [73.8062, 18.5072], [73.8078, 18.5072], [73.8078, 18.5088], [73.8062, 18.5088], [73.8062, 18.5072]
    ],
    ownerName: 'Vandana Shrikant Joshi',
    ownerGender: 'Female',
    ownershipType: 'Joint Family',
    regDate: '2014-03-22',
    regNumber: 'PUN-HVL/1429/2014',
    sroOffice: 'Sub-Registrar Haveli 3',
    stampDuty: 195000,
    marketValuation: 39000000,
    coOwners: ['Prashant Joshi', 'Anand Joshi'],
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 1.75,
    farUtilized: 1.6,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: true,
    stayOrderActive: true,
    courtCase: 'OS-PUN-772/2024',
    stayOrderDetails: 'Status-quo injunction granted by Senior Civil Division Court regarding ancestral partition deed.',
    disputeReason: 'Partition dispute filed by coparcener heirs challenging registered succession certificate.',
    taxAssessmentNo: 'PMC/KTH/2026/01184',
    taxDemand: 24000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  // MH-4: Zoning Mismatch: Master Plan = 'Industrial', Registered Land Use = 'Agricultural' (Scenario 7 - Zoning Mismatch 1)
  makePuneParcel({
    surveyNumber: '240/1',
    lat: 18.5910,
    lon: 73.7190,
    subDistrict: 'Mulshi',
    villageWard: 'Hinjawadi Phase 2 MIDC',
    pinCode: '411057',
    polygon: [
      [73.7180, 18.5900], [73.7202, 18.5900], [73.7202, 18.5920], [73.7180, 18.5920], [73.7180, 18.5900]
    ],
    ownerName: 'Pratibha Kisanrao Pawar',
    ownerGender: 'Female',
    ownershipType: 'Private Individual',
    regDate: '2020-07-09',
    regNumber: 'PUN-MUL/4901/2020',
    sroOffice: 'Sub-Registrar Paud Mulshi',
    stampDuty: 320000,
    marketValuation: 64000000,
    masterPlan: 'Industrial',
    registeredUse: 'Agricultural', // Inconsistency!
    farAllowed: 1.5,
    farUtilized: 0.2,
    buildingStatus: 'Pending Review',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'PMC/HIN/2026/02401',
    taxDemand: 16000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makePuneParcel({
    surveyNumber: '33/7',
    lat: 18.5670,
    lon: 73.9140,
    subDistrict: 'Haveli',
    villageWard: 'Viman Nagar Dutta Mandir',
    pinCode: '411014',
    polygon: [
      [73.9130, 18.5662], [73.9148, 18.5662], [73.9148, 18.5678], [73.9130, 18.5678], [73.9130, 18.5662]
    ],
    ownerName: 'TechPark Infra Ventures LLP',
    ownerGender: 'Entity',
    ownershipType: 'Corporate',
    regDate: '2022-12-15',
    regNumber: 'PUN-HVL/9842/2022',
    sroOffice: 'Sub-Registrar Haveli 2',
    stampDuty: 950000,
    marketValuation: 190000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 3.0,
    farUtilized: 2.85,
    buildingStatus: 'Approved',
    hasMortgage: true,
    disputeFlag: false,
    mortgage: { lender: 'Axis Bank Ltd', amount: 80000000, date: '2023-01-10', chargeId: 'CHG-AXIS-4019' },
    taxAssessmentNo: 'PMC/VMN/2026/0337',
    taxDemand: 180000,
    taxStatus: 'Paid',
    taxYear: 2026
  })
];
