import { Parcel } from '../../../shared/types';
import { generateUlpin, formatUlpin } from '../../../shared/ulpin';
import { calculateArea } from '../../services/geo';

function makeHyderabadParcel(data: {
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
  sroDeeds?: Parcel['sroDeeds'];
  cersaiCharges?: Parcel['cersaiCharges'];
}): Parcel {
  const boundaryGeojson = { type: 'Polygon' as const, coordinates: [data.polygon] };
  const { areaSqm, areaAcres } = calculateArea(boundaryGeojson);
  const ulpin = generateUlpin('TS', data.lat, data.lon, data.surveyNumber);

  return {
    ulpin,
    displayUlpin: formatUlpin(ulpin),
    surveyNumber: data.surveyNumber,
    centroidLat: data.lat,
    centroidLon: data.lon,
    areaSqm,
    areaAcres,
    state: 'Telangana',
    stateCode: 'TS',
    district: 'Hyderabad',
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
    },
    sroDeeds: data.sroDeeds,
    cersaiCharges: data.cersaiCharges
  };
}

export const HYDERABAD_PARCELS: Parcel[] = [
  // TS-1: Near Durgam Cheruvu Lake (within 50m of waterbody buffer)
  makeHyderabadParcel({
    surveyNumber: '44/1',
    lat: 17.4352,
    lon: 78.3855,
    subDistrict: 'Serilingampally',
    villageWard: 'Madhapur Knowledge City',
    pinCode: '500081',
    polygon: [
      [78.3848, 17.4345], [78.3862, 17.4345], [78.3862, 17.4358], [78.3848, 17.4358], [78.3848, 17.4345]
    ],
    ownerName: 'Venkata Satyanarayana Raju',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2021-03-12',
    regNumber: 'HYD-SRL/2190/2021',
    sroOffice: 'Sub-Registrar Serilingampally',
    stampDuty: 520000,
    marketValuation: 104000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 3.5,
    farUtilized: 3.2,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'GHMC/WZ/2026/0441',
    taxDemand: 98000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  // TS-2: Two conflicting sale deeds registered 35 days apart (Duplicate Conveyance Anomaly)
  makeHyderabadParcel({
    surveyNumber: '89/3',
    lat: 17.4410,
    lon: 78.3580,
    subDistrict: 'Serilingampally',
    villageWard: 'Gachibowli Financial District',
    pinCode: '500032',
    polygon: [
      [78.3572, 17.4402], [78.3588, 17.4402], [78.3588, 17.4418], [78.3572, 17.4418], [78.3572, 17.4402]
    ],
    ownerName: 'K. Chandrasekhar Reddy',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2025-11-04',
    regNumber: 'HYD-SRL/8821/2025',
    sroOffice: 'Sub-Registrar Serilingampally',
    stampDuty: 640000,
    marketValuation: 128000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 3.0,
    farUtilized: 2.1,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'GHMC/WZ/2026/0893',
    taxDemand: 112000,
    taxStatus: 'Paid',
    taxYear: 2026,
    sroDeeds: [
      {
        deedId: 'DEED-TS-2025-8821',
        parcelUlpin: '',
        deedType: 'SALE_DEED',
        buyerName: 'K. Chandrasekhar Reddy',
        sellerName: 'M. Prabhakar Rao',
        registrationDate: '2025-11-04',
        considerationAmountInr: 128000000,
        sroCode: 'SRO-SRL-02'
      },
      {
        deedId: 'DEED-TS-2025-9104',
        parcelUlpin: '',
        deedType: 'SALE_DEED',
        buyerName: 'Global Horizon Tech Estates Pvt Ltd',
        sellerName: 'M. Prabhakar Rao',
        registrationDate: '2025-12-09',
        considerationAmountInr: 135000000,
        sroCode: 'SRO-SRL-02'
      }
    ]
  }),
  // TS-3: CERSAI charge exists but SRO has mortgage: false (Undisclosed Banking Lien)
  makeHyderabadParcel({
    surveyNumber: '104/A',
    lat: 17.4150,
    lon: 78.4480,
    subDistrict: 'Shaikpet',
    villageWard: 'Banjara Hills Road No 12',
    pinCode: '500034',
    polygon: [
      [78.4472, 17.4142], [78.4488, 17.4142], [78.4488, 17.4158], [78.4472, 17.4158], [78.4472, 17.4142]
    ],
    ownerName: 'Mohd. Tariq Ahmed',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2022-04-19',
    regNumber: 'HYD-BAN/3901/2022',
    sroOffice: 'Sub-Registrar Banjara Hills',
    stampDuty: 420000,
    marketValuation: 84000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.25,
    farUtilized: 2.1,
    buildingStatus: 'Approved',
    hasMortgage: false, // SRO reports NIL mortgage!
    disputeFlag: false,
    taxAssessmentNo: 'GHMC/CZ/2026/0104A',
    taxDemand: 45000,
    taxStatus: 'Paid',
    taxYear: 2026,
    cersaiCharges: [
      {
        chargeId: 'CERSAI-SBI-2024-99812',
        parcelUlpin: '',
        financialInstitution: 'State Bank of India',
        assetType: 'IMMOVABLE_PROPERTY',
        sanctionAmountInr: 85000000,
        chargeCreationDate: '2024-03-15',
        status: 'ACTIVE'
      }
    ]
  }),
  makeHyderabadParcel({
    surveyNumber: '215/2',
    lat: 17.4320,
    lon: 78.4080,
    subDistrict: 'Shaikpet',
    villageWard: 'Jubilee Hills Checkpost',
    pinCode: '500033',
    polygon: [
      [78.4072, 17.4312], [78.4088, 17.4312], [78.4088, 17.4328], [78.4072, 17.4328], [78.4072, 17.4312]
    ],
    ownerName: 'Dr. G. V. Ramana Rao',
    ownerGender: 'Male',
    ownershipType: 'Private Individual',
    regDate: '2017-06-11',
    regNumber: 'HYD-JUB/1844/2017',
    sroOffice: 'Sub-Registrar Banjara Hills',
    stampDuty: 350000,
    marketValuation: 70000000,
    masterPlan: 'Residential',
    registeredUse: 'Residential',
    farAllowed: 2.0,
    farUtilized: 1.8,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'GHMC/CZ/2026/02152',
    taxDemand: 38000,
    taxStatus: 'Paid',
    taxYear: 2026
  }),
  makeHyderabadParcel({
    surveyNumber: '302/B',
    lat: 17.4880,
    lon: 78.4110,
    subDistrict: 'Kukatpally',
    villageWard: 'KPHB Colony Phase 3',
    pinCode: '500072',
    polygon: [
      [78.4102, 17.4872], [78.4118, 17.4872], [78.4118, 17.4888], [78.4102, 17.4888], [78.4102, 17.4872]
    ],
    ownerName: 'N. Padmavathi Devi',
    ownerGender: 'Female',
    ownershipType: 'Private Individual',
    regDate: '2023-08-25',
    regNumber: 'HYD-KUK/5012/2023',
    sroOffice: 'Sub-Registrar Kukatpally',
    stampDuty: 220000,
    marketValuation: 44000000,
    masterPlan: 'Commercial',
    registeredUse: 'Commercial',
    farAllowed: 2.75,
    farUtilized: 2.5,
    buildingStatus: 'Approved',
    hasMortgage: false,
    disputeFlag: false,
    taxAssessmentNo: 'GHMC/NZ/2026/0302B',
    taxDemand: 26000,
    taxStatus: 'Paid',
    taxYear: 2026
  })
];
