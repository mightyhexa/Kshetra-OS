import { Parcel } from '../../../shared/types';
import { generateUlpin, formatUlpin } from '../../../shared/ulpin';
import { calculateArea } from '../../services/geo';

function makeAhmedabadParcel(data: {
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
  const ulpin = generateUlpin('GJ', data.lat, data.lon, data.surveyNumber);

  return {
    ulpin,
    displayUlpin: formatUlpin(ulpin),
    surveyNumber: data.surveyNumber,
    centroidLat: data.lat,
    centroidLon: data.lon,
    areaSqm,
    areaAcres,
    state: 'Gujarat',
    stateCode: 'GJ',
    district: 'Ahmedabad',
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

export const AHMEDABAD_PARCELS: Parcel[] = [
  // GJ-1: Near Vastrapur Lake (within 45m of waterbody, Scenario 3 - Waterbody 3)
  makeAhmedabadParcel({
    surveyNumber: '158/3',
    lat: 23.0362,
    lon: 72.5288,
    subDistrict: 'Ghatlodiya',
    villageWard: 'Vastrapur Lake Road',
    pinCode: '380015',
    polygon: [
      [72.5280, 23.0355], [72.5295, 23.0355], [72.5295, 23.0368], [72.5280, 23.0368], [72.5280, 23.0355]
    ],
    ownerName: 'Harshadrai Shantilal Mehta',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2021-12-05',
    regNumber: 'AHM-GHT/5812/2021',
    sroOffice: 'Sub-Registrar Ghatlodiya',
    stampDuty: 390000,
    marketValuation: 78000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.25,
    farUtilized: 2.1,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'AMC/NWZ/2026/01583',
    taxDemand: 48000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  // GJ-2: Active Court Litigation with Stay Order (Scenario 4 - Court 4)
  makeAhmedabadParcel({
    surveyNumber: '82/A',
    lat: 23.0450,
    lon: 72.5180,
    subDistrict: 'Ghatlodiya',
    villageWard: 'Bodakdev Judges Bungalow',
    pinCode: '380054',
    polygon: [
      [72.5172, 23.0442], [72.5188, 23.0442], [72.5188, 23.0458], [72.5172, 23.0458], [72.5172, 23.0442]
    ],
    ownerName: 'Kiritbhai Bhikhabhai Patel',
    ownerGender: 'Male',
    ownershipType: 'Joint Family',
    regDate: '2015-06-20',
    regNumber: 'AHM-GHT/2901/2015',
    sroOffice: 'Sub-Registrar Ghatlodiya',
    stampDuty: 450000,
    marketValuation: 90000000,
    coOwners: ['Geetaben Patel', 'Chirag Patel'],
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.0,
    farUtilized: 1.8,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: true,
    stayOrderActive: true,
    courtCase: 'SCA-AHM-902/2024',
    stayOrderDetails: 'Gujarat High Court ad-interim stay on execution of revenue entry mutation No. 4108.',
    disputeReason: 'Special Civil Application challenging Town Planning Scheme reservation allotment procedure.',
    taxAssessmentNo: 'AMC/NWZ/2026/0082A',
    taxDemand: 56000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makeAhmedabadParcel({
    surveyNumber: '319/1',
    lat: 23.0610,
    lon: 72.5020,
    subDistrict: 'Daskroi',
    villageWard: 'Thaltej SG Highway',
    pinCode: '380059',
    polygon: [
      [72.5010, 23.0602], [72.5030, 23.0602], [72.5030, 23.0618], [72.5010, 23.0618], [72.5010, 23.0602]
    ],
    ownerName: 'Gujarat Commercial Developers Ltd',
    ownerGender: 'Entity',
    ownershipType: 'Corporate',
    regDate: '2023-03-14',
    regNumber: 'AHM-DSK/8109/2023',
    sroOffice: 'Sub-Registrar Daskroi',
    stampDuty: 1100000,
    marketValuation: 220000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 3.5,
    farUtilized: 3.3,
    buildingStatus: 'Approved',
    hasMortgage: true,
    disputeFlag: false,
    mortgage: { lender: 'Bank of Baroda', amount: 95000000, date: '2023-04-10', chargeId: 'CHG-BOB-7712' },
    taxAssessmentNo: 'AMC/WZ/2026/03191',
    taxDemand: 165000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makeAhmedabadParcel({
    surveyNumber: '47/2',
    lat: 23.0330,
    lon: 72.5620,
    subDistrict: 'Sabarmati',
    villageWard: 'Navrangpura CG Road',
    pinCode: '380009',
    polygon: [
      [72.5612, 23.0322], [72.5628, 23.0322], [72.5628, 23.0338], [72.5612, 23.0338], [72.5612, 23.0322]
    ],
    ownerName: 'Dineshbhai Manilal Shah',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2019-08-11',
    regNumber: 'AHM-SBM/3910/2019',
    sroOffice: 'Sub-Registrar Sabarmati',
    stampDuty: 290000,
    marketValuation: 58000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 2.75,
    farUtilized: 2.65,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'AMC/CZ/2026/00472',
    taxDemand: 39000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makeAhmedabadParcel({
    surveyNumber: '95/4',
    lat: 23.0240,
    lon: 72.5310,
    subDistrict: 'Ghatlodiya',
    villageWard: 'Satellite Jodhpur Gam',
    pinCode: '380015',
    polygon: [
      [72.5302, 23.0232], [72.5318, 23.0232], [72.5318, 23.0248], [72.5302, 23.0248], [72.5302, 23.0232]
    ],
    ownerName: 'Bhavnaben Bharatkumar Modi',
    ownerGender: 'Female',
    ownershipType: 'Private Individual',
    regDate: '2022-09-17',
    regNumber: 'AHM-GHT/7710/2022',
    sroOffice: 'Sub-Registrar Ghatlodiya',
    stampDuty: 240000,
    marketValuation: 48000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.0,
    farUtilized: 1.85,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'AMC/SWZ/2026/00954',
    taxDemand: 27000,
    taxStatus: 'Paid',
    taxYear: 2026
  })
];
