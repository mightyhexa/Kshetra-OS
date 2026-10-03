import { Parcel } from '../../../shared/types';
import { generateUlpin, formatUlpin } from '../../../shared/ulpin';
import { calculateArea } from '../../services/geo';

// Helper to construct parcel
function makeParcel(data: {
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
  const ulpin = generateUlpin('KA', data.lat, data.lon, data.surveyNumber);

  return {
    ulpin,
    displayUlpin: formatUlpin(ulpin),
    surveyNumber: data.surveyNumber,
    centroidLat: data.lat,
    centroidLon: data.lon,
    areaSqm,
    areaAcres,
    state: 'Karnataka',
    stateCode: 'KA',
    district: 'Bengaluru Urban',
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

// 6 Parcels in Bengaluru Urban
// KA-1: Near Ulsoor lake (within 45m of waterbody)
// KA-3 and KA-4: Slivers overlap by 0.3% (survey tolerance)
export const BENGALURU_PARCELS: Parcel[] = [
  makeParcel({
    surveyNumber: '142/2A',
    lat: 12.9818,
    lon: 77.6205,
    subDistrict: 'Bengaluru East',
    villageWard: 'Ulsoor Ward 90',
    pinCode: '560008',
    polygon: [
      [77.6201, 12.9815], [77.6212, 12.9815], [77.6212, 12.9823], [77.6201, 12.9823], [77.6201, 12.9815]
    ],
    ownerName: 'Venkata Ramanappa Gowda',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2021-08-14',
    regNumber: 'BLR-EST/4102/2021',
    sroOffice: 'Sub-Registrar Shivajinagar',
    stampDuty: 245000,
    marketValuation: 48000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.25,
    farUtilized: 1.85,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'BBMP/EST/2026/01422A',
    taxDemand: 34200,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makeParcel({
    surveyNumber: '88/1',
    lat: 12.9784,
    lon: 77.6408,
    subDistrict: 'Bengaluru East',
    villageWard: 'Indiranagar 2nd Stage',
    pinCode: '560038',
    polygon: [
      [77.6402, 12.9779], [77.6415, 12.9779], [77.6415, 12.9788], [77.6402, 12.9788], [77.6402, 12.9779]
    ],
    ownerName: 'Priya Sundaram',
    ownerGender: 'Female',
    ownershipType: 'Private Individual',
    regDate: '2023-01-20',
    regNumber: 'BLR-EST/1029/2023',
    sroOffice: 'Sub-Registrar Indiranagar',
    stampDuty: 380000,
    marketValuation: 72000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 3.0,
    farUtilized: 2.9,
    buildingStatus: 'Approved',
    hasMortgage: true,
    disputeFlag: false,
    mortgage: { lender: 'HDFC Bank Ltd', amount: 35000000, date: '2023-02-05', chargeId: 'CHG-HDFC-9102' },
    taxAssessmentNo: 'BBMP/EST/2026/00881',
    taxDemand: 82000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makeParcel({
    surveyNumber: '64/3B',
    lat: 12.9345,
    lon: 77.6190,
    subDistrict: 'Bengaluru South',
    villageWard: 'Koramangala 4th Block',
    pinCode: '560034',
    // Polygon 3 shares edge with Polygon 4 with a 0.3% sliver overlap
    polygon: [
      [77.6185, 12.9340], [77.6198, 12.9340], [77.6198, 12.9350], [77.6185, 12.9350], [77.6185, 12.9340]
    ],
    ownerName: 'Rajesh K. Verma',
    ownerGender: 'Male',
    ownershipType: 'Joint Family',
    regDate: '2019-11-10',
    regNumber: 'BLR-STH/8812/2019',
    sroOffice: 'Sub-Registrar Koramangala',
    stampDuty: 290000,
    marketValuation: 55000000,
    coOwners: ['Anita Verma', 'Kunal Verma'],
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.0,
    farUtilized: 1.7,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'BBMP/STH/2026/0643B',
    taxDemand: 28500,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makeParcel({
    surveyNumber: '64/3C',
    lat: 12.9345,
    lon: 77.6202,
    subDistrict: 'Bengaluru South',
    villageWard: 'Koramangala 4th Block',
    pinCode: '560034',
    // Slightly overlaps parcel 3 edge: 77.619796 instead of 77.6198 (sliver overlap ~0.33%)
    polygon: [
      [77.619796, 12.9340], [77.6210, 12.9340], [77.6210, 12.9350], [77.619796, 12.9350], [77.619796, 12.9340]
    ],
    ownerName: 'Manjula Krishnamurthy',
    ownerGender: 'Female',
    ownershipType: 'Private Individual',
    regDate: '2020-04-18',
    regNumber: 'BLR-STH/1902/2020',
    sroOffice: 'Sub-Registrar Koramangala',
    stampDuty: 210000,
    marketValuation: 41000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.0,
    farUtilized: 1.9,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'BBMP/STH/2026/0643C',
    taxDemand: 22000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makeParcel({
    surveyNumber: '112/4',
    lat: 12.9719,
    lon: 77.7499,
    subDistrict: 'Bengaluru East',
    villageWard: 'Whitefield Export Zone',
    pinCode: '560066',
    polygon: [
      [77.7490, 12.9710], [77.7508, 12.9710], [77.7508, 12.9725], [77.7490, 12.9725], [77.7490, 12.9710]
    ],
    ownerName: 'Apex Infotech Infrastructure LLP',
    ownerGender: 'Entity',
    ownershipType: 'Corporate',
    regDate: '2022-06-30',
    regNumber: 'BLR-EST/9912/2022',
    sroOffice: 'Sub-Registrar K.R. Puram',
    stampDuty: 1450000,
    marketValuation: 280000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 3.25,
    farUtilized: 3.1,
    buildingStatus: 'Approved',
    hasMortgage: true,
    disputeFlag: false,
    mortgage: { lender: 'State Bank of India', amount: 120000000, date: '2022-07-15', chargeId: 'CHG-SBI-8819' },
    taxAssessmentNo: 'BBMP/MAH/2026/01124',
    taxDemand: 240000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makeParcel({
    surveyNumber: '19/1A',
    lat: 13.0358,
    lon: 77.5970,
    subDistrict: 'Bengaluru North',
    villageWard: 'Hebbal Kempapura',
    pinCode: '560024',
    polygon: [
      [77.5962, 13.0350], [77.5978, 13.0350], [77.5978, 13.0365], [77.5962, 13.0365], [77.5962, 13.0350]
    ],
    ownerName: 'Suresh Babu Naidu',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2018-09-05',
    regNumber: 'BLR-NTH/4180/2018',
    sroOffice: 'Sub-Registrar Yelahanka',
    stampDuty: 180000,
    marketValuation: 36000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.0,
    farUtilized: 2.35,
    buildingStatus: 'Violation Notice Issued',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'BBMP/NTH/2026/0191A',
    taxDemand: 19500,
    taxStatus: 'Paid',
    taxYear: 2026
  })
];
