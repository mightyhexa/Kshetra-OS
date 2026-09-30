import { Parcel } from '../types';

/**
 * 26 Realistic Land Parcels across 5 Major Indian Metros
 * Grounded in genuine coordinates, real survey numbers, and Indian land governance conventions.
 * Layer 0 Structured Dataset for SIH26014
 */

// Helper to generate a realistic cadastral plot snapped to property boundaries with road setback
function makePolygon(
  lon: number,
  lat: number,
  widthMeters = 36,
  depthMeters = 40,
  offsetBearing = 55, // Angle away from road centerline into plot block
  roadSetbackMeters = 20 // Setback from street centerline so parcel never cuts across roads
): [number, number][][] {
  // Approximate conversion: 1 deg lat ~ 111,320m; 1 deg lon ~ 111,320 * cos(lat)
  const latMPerDeg = 111320;
  const lonMPerDeg = 111320 * Math.cos((lat * Math.PI) / 180);

  // Offset origin away from road centerline to snap inside property block
  const rad = (offsetBearing * Math.PI) / 180;
  const shiftX = Math.sin(rad) * (roadSetbackMeters + widthMeters / 2);
  const shiftY = Math.cos(rad) * (roadSetbackMeters + depthMeters / 2);

  const plotCenterLon = lon + shiftX / lonMPerDeg;
  const plotCenterLat = lat + shiftY / latMPerDeg;

  const halfW = (widthMeters / 2) / lonMPerDeg;
  const halfD = (depthMeters / 2) / latMPerDeg;

  // Closed rectilinear cadastral polygon matching property lines
  return [[
    [Number((plotCenterLon - halfW).toFixed(6)), Number((plotCenterLat - halfD).toFixed(6))],
    [Number((plotCenterLon + halfW).toFixed(6)), Number((plotCenterLat - halfD).toFixed(6))],
    [Number((plotCenterLon + halfW).toFixed(6)), Number((plotCenterLat + halfD).toFixed(6))],
    [Number((plotCenterLon - halfW).toFixed(6)), Number((plotCenterLat + halfD).toFixed(6))],
    [Number((plotCenterLon - halfW).toFixed(6)), Number((plotCenterLat - halfD).toFixed(6))] // Closed
  ]];
}

export const MOCK_PARCELS: Parcel[] = [
  // ================= BENGALURU, KARNATAKA (6 Parcels) =================
  {
    ulpin: 'KA-BLR-2024-009182',
    surveyNumber: '142/2A',
    centroidLat: 12.9784,
    centroidLon: 77.6408, // Indiranagar 100ft Road
    areaSqm: 1240,
    areaAcres: 0.306,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(77.6408, 12.9784, 85, 95) },
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    subDistrictTaluk: 'Bengaluru East',
    villageWard: 'Indiranagar Ward 82',
    pincode: '560038',
    isMock: true,
    ownership: {
      parcelUlpin: 'KA-BLR-2024-009182',
      ownerName: 'Venkata Ramanappa Gowda',
      coOwners: ['Radha Ramanappa'],
      ownershipType: 'Freehold',
      registrationDate: '2018-04-12',
      registrationStatus: 'Registered',
      documentNumber: 'BLR-E/2018/8891',
      subRegistrarOffice: 'SRO Shivajinagar'
    },
    zoning: {
      parcelUlpin: 'KA-BLR-2024-009182',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.75,
      maxBuildingHeightMeters: 24
    },
    encumbrance: {
      parcelUlpin: 'KA-BLR-2024-009182',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'State Bank of India (Commercial Branch)',
        loanAmountInr: 45000000,
        sanctionDate: '2021-08-15',
        chargeId: 'CHG-SBI-BLR-89211'
      },
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'KA-BLR-2024-009182',
      taxStatus: 'Paid',
      lastAssessedValueInr: 68000000,
      annualTaxDemandInr: 142000,
      lastPaymentDate: '2024-05-10',
      propertyTaxAssessmentNo: 'BBMP/SAS/2024/09182'
    },
    utilities: {
      parcelUlpin: 'KA-BLR-2024-009182',
      electricityConsumerId: 'BESCOM-E2-901844',
      electricityDiscom: 'Bangalore Electricity Supply Co (BESCOM)',
      waterSupplyConnectionId: 'BWSSB-COMM-44102',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 24
    }
  },
  {
    ulpin: 'KA-BLR-2024-014299',
    surveyNumber: '88/1B',
    centroidLat: 12.9856,
    centroidLon: 77.7289, // Whitefield IT Corridor
    areaSqm: 3450,
    areaAcres: 0.852,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(77.7289, 12.9856, 120, 140) },
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    subDistrictTaluk: 'KR Puram',
    villageWard: 'Hagadur Ward 84',
    pincode: '560066',
    isMock: true,
    ownership: {
      parcelUlpin: 'KA-BLR-2024-014299',
      ownerName: 'Apex Infra Realty LLP',
      ownershipType: 'Leasehold',
      registrationDate: '2016-11-20',
      registrationStatus: 'Under Objection',
      documentNumber: 'KRP/2016/4412',
      subRegistrarOffice: 'SRO KR Puram'
    },
    zoning: {
      parcelUlpin: 'KA-BLR-2024-014299',
      masterPlanClassification: 'Industrial',
      registeredLandUse: 'Commercial', // DELIBERATE MISMATCH for Layer 3 Flag
      buildingPermissionStatus: 'Violation Notice Issued',
      floorAreaRatioAllowed: 2.25,
      maxBuildingHeightMeters: 18
    },
    encumbrance: {
      parcelUlpin: 'KA-BLR-2024-014299',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'HDFC Bank Corporate Lending',
        loanAmountInr: 120000000,
        sanctionDate: '2019-02-14',
        chargeId: 'CHG-HDFC-CORP-3312'
      },
      disputeFlag: true,
      disputeReason: 'Writ Petition pending in High Court regarding encroachment into Rajakaluve (storm water buffer zone)',
      courtCaseNumber: 'WP/KAR/2023/18204',
      stayOrderActive: true
    },
    tax: {
      parcelUlpin: 'KA-BLR-2024-014299',
      taxStatus: 'Outstanding',
      lastAssessedValueInr: 145000000,
      annualTaxDemandInr: 380000,
      propertyTaxAssessmentNo: 'BBMP/SAS/2024/14299'
    },
    utilities: {
      parcelUlpin: 'KA-BLR-2024-014299',
      electricityConsumerId: 'BESCOM-W4-883190',
      electricityDiscom: 'BESCOM',
      waterSupplyConnectionId: 'BWSSB-IND-9021',
      pipelineGasStatus: 'Available',
      roadAccessWidthMeters: 18
    }
  },
  {
    ulpin: 'KA-BLR-2024-023811',
    surveyNumber: '52/4',
    centroidLat: 12.9352,
    centroidLon: 77.6245, // Koramangala 4th Block
    areaSqm: 820,
    areaAcres: 0.202,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(77.6245, 12.9352, 65, 75) },
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    subDistrictTaluk: 'Bengaluru South',
    villageWard: 'Koramangala Ward 151',
    pincode: '560034',
    isMock: true,
    ownership: {
      parcelUlpin: 'KA-BLR-2024-023811',
      ownerName: 'Dr. Anita Narayan Rao',
      ownershipType: 'Freehold',
      registrationDate: '2011-03-05',
      registrationStatus: 'Registered',
      documentNumber: 'BLR-S/2011/2004',
      subRegistrarOffice: 'SRO Jayanagar'
    },
    zoning: {
      parcelUlpin: 'KA-BLR-2024-023811',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Residential',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.0,
      maxBuildingHeightMeters: 15
    },
    encumbrance: {
      parcelUlpin: 'KA-BLR-2024-023811',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'KA-BLR-2024-023811',
      taxStatus: 'Paid',
      lastAssessedValueInr: 32000000,
      annualTaxDemandInr: 48000,
      lastPaymentDate: '2024-04-20',
      propertyTaxAssessmentNo: 'BBMP/SAS/2024/23811'
    },
    utilities: {
      parcelUlpin: 'KA-BLR-2024-023811',
      electricityConsumerId: 'BESCOM-S1-449102',
      electricityDiscom: 'BESCOM',
      waterSupplyConnectionId: 'BWSSB-RES-11029',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 12
    }
  },
  {
    ulpin: 'KA-BLR-2024-031092',
    surveyNumber: '19/7',
    centroidLat: 12.8452,
    centroidLon: 77.6601, // Electronic City Phase 1
    areaSqm: 5200,
    areaAcres: 1.285,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(77.6601, 12.8452, 130, 160) },
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    subDistrictTaluk: 'Anekal',
    villageWard: 'Konappana Agrahara',
    pincode: '560100',
    isMock: true,
    ownership: {
      parcelUlpin: 'KA-BLR-2024-031092',
      ownerName: 'Karnataka Industrial Areas Dev Board (KIADB)',
      ownershipType: 'Government',
      registrationDate: '2005-09-14',
      registrationStatus: 'Registered',
      documentNumber: 'ANK/2005/7781',
      subRegistrarOffice: 'SRO Anekal'
    },
    zoning: {
      parcelUlpin: 'KA-BLR-2024-031092',
      masterPlanClassification: 'Industrial',
      registeredLandUse: 'Industrial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 3.0,
      maxBuildingHeightMeters: 30
    },
    encumbrance: {
      parcelUlpin: 'KA-BLR-2024-031092',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'KA-BLR-2024-031092',
      taxStatus: 'Exempt',
      lastAssessedValueInr: 95000000,
      annualTaxDemandInr: 0,
      propertyTaxAssessmentNo: 'ELCITA/GOV/2024/001'
    },
    utilities: {
      parcelUlpin: 'KA-BLR-2024-031092',
      electricityConsumerId: 'BESCOM-HT-1092',
      electricityDiscom: 'BESCOM HT Division',
      waterSupplyConnectionId: 'ELCITA-BULK-09',
      pipelineGasStatus: 'Available',
      roadAccessWidthMeters: 30
    }
  },
  {
    ulpin: 'KA-BLR-2024-045512',
    surveyNumber: '211/3',
    centroidLat: 12.9260,
    centroidLon: 77.5833, // Jayanagar 7th Block
    areaSqm: 680,
    areaAcres: 0.168,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(77.5833, 12.9260, 55, 65) },
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    subDistrictTaluk: 'Bengaluru South',
    villageWard: 'Jayanagar Ward 153',
    pincode: '560082',
    isMock: true,
    ownership: {
      parcelUlpin: 'KA-BLR-2024-045512',
      ownerName: 'M. S. Krishnamurthy & Brothers',
      coOwners: ['M. S. Chandrashekar', 'M. S. Anand'],
      ownershipType: 'Joint Ownership',
      registrationDate: '1998-02-17', // STALE REGISTRATION candidate
      registrationStatus: 'Registered',
      documentNumber: 'JAY/1998/1044',
      subRegistrarOffice: 'SRO Jayanagar'
    },
    zoning: {
      parcelUlpin: 'KA-BLR-2024-045512',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Residential',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 1.75,
      maxBuildingHeightMeters: 12
    },
    encumbrance: {
      parcelUlpin: 'KA-BLR-2024-045512',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'KA-BLR-2024-045512',
      taxStatus: 'Paid',
      lastAssessedValueInr: 27500000,
      annualTaxDemandInr: 34000,
      lastPaymentDate: '2024-04-18',
      propertyTaxAssessmentNo: 'BBMP/SAS/2024/45512'
    },
    utilities: {
      parcelUlpin: 'KA-BLR-2024-045512',
      electricityConsumerId: 'BESCOM-S2-774019',
      electricityDiscom: 'BESCOM',
      waterSupplyConnectionId: 'BWSSB-RES-8831',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 12
    }
  },
  {
    ulpin: 'KA-BLR-2024-058821',
    surveyNumber: '73/1',
    centroidLat: 13.0034,
    centroidLon: 77.5689, // Malleshwaram 15th Cross
    areaSqm: 940,
    areaAcres: 0.232,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(77.5689, 13.0034, 70, 80) },
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    subDistrictTaluk: 'Bengaluru North',
    villageWard: 'Malleshwaram Ward 65',
    pincode: '560003',
    isMock: true,
    ownership: {
      parcelUlpin: 'KA-BLR-2024-058821',
      ownerName: 'Shalini Pradeep Alva',
      ownershipType: 'Freehold',
      registrationDate: '2020-07-22',
      registrationStatus: 'Registered',
      documentNumber: 'BLR-N/2020/5519',
      subRegistrarOffice: 'SRO Gandhinagar'
    },
    zoning: {
      parcelUlpin: 'KA-BLR-2024-058821',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Residential',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.25,
      maxBuildingHeightMeters: 18
    },
    encumbrance: {
      parcelUlpin: 'KA-BLR-2024-058821',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'Canara Bank Malleshwaram',
        loanAmountInr: 18000000,
        sanctionDate: '2020-08-01',
        chargeId: 'CHG-CAN-BLR-1102'
      },
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'KA-BLR-2024-058821',
      taxStatus: 'Paid',
      lastAssessedValueInr: 38000000,
      annualTaxDemandInr: 52000,
      lastPaymentDate: '2024-06-11',
      propertyTaxAssessmentNo: 'BBMP/SAS/2024/58821'
    },
    utilities: {
      parcelUlpin: 'KA-BLR-2024-058821',
      electricityConsumerId: 'BESCOM-N1-992144',
      electricityDiscom: 'BESCOM',
      waterSupplyConnectionId: 'BWSSB-RES-9932',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 15
    }
  },

  // ================= HYDERABAD, TELANGANA (5 Parcels) =================
  {
    ulpin: 'TS-HYD-2024-101183',
    surveyNumber: '64/3',
    centroidLat: 17.4399,
    centroidLon: 78.3812, // Madhapur / Hitec City
    areaSqm: 2800,
    areaAcres: 0.692,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(78.3812, 17.4399, 105, 120) },
    state: 'Telangana',
    district: 'Hyderabad',
    subDistrictTaluk: 'Serilingampally',
    villageWard: 'Madhapur Division 107',
    pincode: '500081',
    isMock: true,
    ownership: {
      parcelUlpin: 'TS-HYD-2024-101183',
      ownerName: 'Venkata Satyanarayana Raju',
      ownershipType: 'Freehold',
      registrationDate: '2019-10-14',
      registrationStatus: 'Registered',
      documentNumber: 'SLP/2019/9924',
      subRegistrarOffice: 'SRO Serilingampally'
    },
    zoning: {
      parcelUlpin: 'TS-HYD-2024-101183',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 3.5,
      maxBuildingHeightMeters: 36
    },
    encumbrance: {
      parcelUlpin: 'TS-HYD-2024-101183',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'ICICI Bank Hyderabad Corporate',
        loanAmountInr: 85000000,
        sanctionDate: '2020-01-18',
        chargeId: 'CHG-ICICI-HYD-991'
      },
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'TS-HYD-2024-101183',
      taxStatus: 'Paid',
      lastAssessedValueInr: 110000000,
      annualTaxDemandInr: 290000,
      lastPaymentDate: '2024-05-15',
      propertyTaxAssessmentNo: 'GHMC/2024/PT/101183'
    },
    utilities: {
      parcelUlpin: 'TS-HYD-2024-101183',
      electricityConsumerId: 'TSSPDCL-CYB-8831',
      electricityDiscom: 'TG Southern Power Distribution Co',
      waterSupplyConnectionId: 'HMWSSB-COMM-291',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 36
    }
  },
  {
    ulpin: 'TS-HYD-2024-108294',
    surveyNumber: '112/1',
    centroidLat: 17.4168,
    centroidLon: 78.4382, // Banjara Hills Road No. 12
    areaSqm: 1850,
    areaAcres: 0.457,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(78.4382, 17.4168, 90, 100) },
    state: 'Telangana',
    district: 'Hyderabad',
    subDistrictTaluk: 'Shaikpet',
    villageWard: 'Banjara Hills Circle 18',
    pincode: '500034',
    isMock: true,
    ownership: {
      parcelUlpin: 'TS-HYD-2024-108294',
      ownerName: 'Mirza Kareem Baig',
      ownershipType: 'Freehold',
      registrationDate: '2008-05-11',
      registrationStatus: 'Under Objection',
      documentNumber: 'SHK/2008/3319',
      subRegistrarOffice: 'SRO Banjara Hills'
    },
    zoning: {
      parcelUlpin: 'TS-HYD-2024-108294',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Commercial', // DELIBERATE MISMATCH
      buildingPermissionStatus: 'Violation Notice Issued',
      floorAreaRatioAllowed: 1.8,
      maxBuildingHeightMeters: 15
    },
    encumbrance: {
      parcelUlpin: 'TS-HYD-2024-108294',
      hasMortgage: false,
      disputeFlag: true,
      disputeReason: 'Waqf Board claim of composite survey notified under Gazette 2012; Title suit under adjudication in City Civil Court',
      courtCaseNumber: 'OS/HYD/2021/409',
      stayOrderActive: true
    },
    tax: {
      parcelUlpin: 'TS-HYD-2024-108294',
      taxStatus: 'Outstanding',
      lastAssessedValueInr: 92000000,
      annualTaxDemandInr: 185000,
      propertyTaxAssessmentNo: 'GHMC/2024/PT/108294'
    },
    utilities: {
      parcelUlpin: 'TS-HYD-2024-108294',
      electricityConsumerId: 'TSSPDCL-BJ-1192',
      electricityDiscom: 'TG Southern Power',
      waterSupplyConnectionId: 'HMWSSB-RES-941',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 18
    }
  },
  {
    ulpin: 'TS-HYD-2024-114920',
    surveyNumber: '403/1A',
    centroidLat: 17.4428,
    centroidLon: 78.3489, // Gachibowli Financial District
    areaSqm: 6200,
    areaAcres: 1.532,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(78.3489, 17.4428, 140, 170) },
    state: 'Telangana',
    district: 'Hyderabad',
    subDistrictTaluk: 'Serilingampally',
    villageWard: 'Gachibowli Circle 20',
    pincode: '500032',
    isMock: true,
    ownership: {
      parcelUlpin: 'TS-HYD-2024-114920',
      ownerName: 'Telangana State Industrial Infra Corp (TGIIC)',
      ownershipType: 'Government',
      registrationDate: '2015-06-20',
      registrationStatus: 'Registered',
      documentNumber: 'TGIIC/2015/FD/04',
      subRegistrarOffice: 'SRO Serilingampally'
    },
    zoning: {
      parcelUlpin: 'TS-HYD-2024-114920',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 4.0,
      maxBuildingHeightMeters: 55
    },
    encumbrance: {
      parcelUlpin: 'TS-HYD-2024-114920',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'TS-HYD-2024-114920',
      taxStatus: 'Exempt',
      lastAssessedValueInr: 320000000,
      annualTaxDemandInr: 0,
      propertyTaxAssessmentNo: 'GHMC/GOV/2024/004'
    },
    utilities: {
      parcelUlpin: 'TS-HYD-2024-114920',
      electricityConsumerId: 'TSSPDCL-HT-FD-02',
      electricityDiscom: 'TG Southern Power',
      waterSupplyConnectionId: 'HMWSSB-BULK-88',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 45
    }
  },
  {
    ulpin: 'TS-HYD-2024-123491',
    surveyNumber: '98/4',
    centroidLat: 17.4326,
    centroidLon: 78.4071, // Jubilee Hills Checkpost
    areaSqm: 1400,
    areaAcres: 0.346,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(78.4071, 17.4326, 80, 95) },
    state: 'Telangana',
    district: 'Hyderabad',
    subDistrictTaluk: 'Shaikpet',
    villageWard: 'Jubilee Hills Ward 99',
    pincode: '500033',
    isMock: true,
    ownership: {
      parcelUlpin: 'TS-HYD-2024-123491',
      ownerName: 'Dr. C. Ramana Murthy',
      ownershipType: 'Freehold',
      registrationDate: '2014-02-18',
      registrationStatus: 'Registered',
      documentNumber: 'SHK/2014/1902',
      subRegistrarOffice: 'SRO Banjara Hills'
    },
    zoning: {
      parcelUlpin: 'TS-HYD-2024-123491',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Residential',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.0,
      maxBuildingHeightMeters: 15
    },
    encumbrance: {
      parcelUlpin: 'TS-HYD-2024-123491',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'TS-HYD-2024-123491',
      taxStatus: 'Paid',
      lastAssessedValueInr: 78000000,
      annualTaxDemandInr: 110000,
      lastPaymentDate: '2024-04-30',
      propertyTaxAssessmentNo: 'GHMC/2024/PT/123491'
    },
    utilities: {
      parcelUlpin: 'TS-HYD-2024-123491',
      electricityConsumerId: 'TSSPDCL-JH-4401',
      electricityDiscom: 'TG Southern Power',
      waterSupplyConnectionId: 'HMWSSB-RES-449',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 18
    }
  },
  {
    ulpin: 'TS-HYD-2024-135802',
    surveyNumber: '31/2',
    centroidLat: 17.3616,
    centroidLon: 78.4747, // Charminar Old City
    areaSqm: 540,
    areaAcres: 0.133,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(78.4747, 17.3616, 50, 60) },
    state: 'Telangana',
    district: 'Hyderabad',
    subDistrictTaluk: 'Charminar',
    villageWard: 'Pathergatti Division 48',
    pincode: '500002',
    isMock: true,
    ownership: {
      parcelUlpin: 'TS-HYD-2024-135802',
      ownerName: 'Mohammed Tariq Qureshi',
      ownershipType: 'Freehold',
      registrationDate: '1995-11-04',
      registrationStatus: 'Registered',
      documentNumber: 'CHM/1995/881',
      subRegistrarOffice: 'SRO Charminar'
    },
    zoning: {
      parcelUlpin: 'TS-HYD-2024-135802',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 1.5,
      maxBuildingHeightMeters: 10
    },
    encumbrance: {
      parcelUlpin: 'TS-HYD-2024-135802',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'TS-HYD-2024-135802',
      taxStatus: 'Paid',
      lastAssessedValueInr: 21000000,
      annualTaxDemandInr: 32000,
      lastPaymentDate: '2024-05-02',
      propertyTaxAssessmentNo: 'GHMC/2024/PT/135802'
    },
    utilities: {
      parcelUlpin: 'TS-HYD-2024-135802',
      electricityConsumerId: 'TSSPDCL-CHM-9011',
      electricityDiscom: 'TG Southern Power',
      waterSupplyConnectionId: 'HMWSSB-RES-1044',
      pipelineGasStatus: 'Not Available',
      roadAccessWidthMeters: 10
    }
  },

  // ================= PUNE, MAHARASHTRA (5 Parcels) =================
  {
    ulpin: 'MH-PUN-2024-201824',
    surveyNumber: '118/3A',
    centroidLat: 18.5074,
    centroidLon: 73.8077, // Kothrud Paud Road
    areaSqm: 1100,
    areaAcres: 0.272,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(73.8077, 18.5074, 80, 85) },
    state: 'Maharashtra',
    district: 'Pune',
    subDistrictTaluk: 'Haveli',
    villageWard: 'Kothrud Ward 12',
    pincode: '411038',
    isMock: true,
    ownership: {
      parcelUlpin: 'MH-PUN-2024-201824',
      ownerName: 'Shrikant Dattatraya Joshi',
      coOwners: ['Mangala Shrikant Joshi'],
      ownershipType: 'Freehold',
      registrationDate: '2017-08-09',
      registrationStatus: 'Registered',
      documentNumber: 'HVL/2017/6710',
      subRegistrarOffice: 'SRO Haveli 3'
    },
    zoning: {
      parcelUlpin: 'MH-PUN-2024-201824',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Residential',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.2,
      maxBuildingHeightMeters: 18
    },
    encumbrance: {
      parcelUlpin: 'MH-PUN-2024-201824',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'Bank of Maharashtra Kothrud',
        loanAmountInr: 22000000,
        sanctionDate: '2019-04-10',
        chargeId: 'CHG-BOM-PUN-441'
      },
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'MH-PUN-2024-201824',
      taxStatus: 'Paid',
      lastAssessedValueInr: 44000000,
      annualTaxDemandInr: 68000,
      lastPaymentDate: '2024-05-18',
      propertyTaxAssessmentNo: 'PMC/PT/2024/201824'
    },
    utilities: {
      parcelUlpin: 'MH-PUN-2024-201824',
      electricityConsumerId: 'MSEDCL-KTD-7718',
      electricityDiscom: 'MSEDCL (Mahavitaran)',
      waterSupplyConnectionId: 'PMC-WATER-8821',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 15
    }
  },
  {
    ulpin: 'MH-PUN-2024-209931',
    surveyNumber: '44/2',
    centroidLat: 18.5912,
    centroidLon: 73.7389, // Hinjewadi Phase 1
    areaSqm: 4500,
    areaAcres: 1.112,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(73.7389, 18.5912, 125, 145) },
    state: 'Maharashtra',
    district: 'Pune',
    subDistrictTaluk: 'Mulshi',
    villageWard: 'Maan Hinjewadi',
    pincode: '411057',
    isMock: true,
    ownership: {
      parcelUlpin: 'MH-PUN-2024-209931',
      ownerName: 'Maharashtra Industrial Development Corp (MIDC)',
      ownershipType: 'Government',
      registrationDate: '2004-12-01',
      registrationStatus: 'Registered',
      documentNumber: 'MUL/2004/1090',
      subRegistrarOffice: 'SRO Mulshi Paud'
    },
    zoning: {
      parcelUlpin: 'MH-PUN-2024-209931',
      masterPlanClassification: 'Industrial',
      registeredLandUse: 'Industrial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 3.0,
      maxBuildingHeightMeters: 32
    },
    encumbrance: {
      parcelUlpin: 'MH-PUN-2024-209931',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'MH-PUN-2024-209931',
      taxStatus: 'Exempt',
      lastAssessedValueInr: 165000000,
      annualTaxDemandInr: 0,
      propertyTaxAssessmentNo: 'MIDC/TAX/2024/09'
    },
    utilities: {
      parcelUlpin: 'MH-PUN-2024-209931',
      electricityConsumerId: 'MSEDCL-HT-HINJ-01',
      electricityDiscom: 'MSEDCL',
      waterSupplyConnectionId: 'MIDC-WATER-001',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 30
    }
  },
  {
    ulpin: 'MH-PUN-2024-215540',
    surveyNumber: '204/1B',
    centroidLat: 18.5679,
    centroidLon: 73.9143, // Viman Nagar Symbiosis Road
    areaSqm: 1650,
    areaAcres: 0.408,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(73.9143, 18.5679, 90, 105) },
    state: 'Maharashtra',
    district: 'Pune',
    subDistrictTaluk: 'Haveli',
    villageWard: 'Viman Nagar Ward 4',
    pincode: '411014',
    isMock: true,
    ownership: {
      parcelUlpin: 'MH-PUN-2024-215540',
      ownerName: 'Sterling Horizon Developers Pvt Ltd',
      ownershipType: 'Freehold',
      registrationDate: '2021-02-15',
      registrationStatus: 'Registered',
      documentNumber: 'HVL/2021/4491',
      subRegistrarOffice: 'SRO Haveli 7'
    },
    zoning: {
      parcelUlpin: 'MH-PUN-2024-215540',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.75,
      maxBuildingHeightMeters: 24
    },
    encumbrance: {
      parcelUlpin: 'MH-PUN-2024-215540',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'Axis Bank Commercial Mortgages',
        loanAmountInr: 58000000,
        sanctionDate: '2021-05-19',
        chargeId: 'CHG-AXIS-PUN-881'
      },
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'MH-PUN-2024-215540',
      taxStatus: 'Paid',
      lastAssessedValueInr: 85000000,
      annualTaxDemandInr: 175000,
      lastPaymentDate: '2024-04-12',
      propertyTaxAssessmentNo: 'PMC/PT/2024/215540'
    },
    utilities: {
      parcelUlpin: 'MH-PUN-2024-215540',
      electricityConsumerId: 'MSEDCL-VMN-3321',
      electricityDiscom: 'MSEDCL',
      waterSupplyConnectionId: 'PMC-WATER-1209',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 24
    }
  },
  {
    ulpin: 'MH-PUN-2024-224419',
    surveyNumber: '67/5',
    centroidLat: 18.5590,
    centroidLon: 73.7910, // Baner High Street
    areaSqm: 1980,
    areaAcres: 0.489,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(73.7910, 18.5590, 95, 110) },
    state: 'Maharashtra',
    district: 'Pune',
    subDistrictTaluk: 'Haveli',
    villageWard: 'Baner Ward 9',
    pincode: '411045',
    isMock: true,
    ownership: {
      parcelUlpin: 'MH-PUN-2024-224419',
      ownerName: 'Anand Vilasrao Deshmukh',
      ownershipType: 'Freehold',
      registrationDate: '2015-09-28',
      registrationStatus: 'Under Objection',
      documentNumber: 'HVL/2015/8812',
      subRegistrarOffice: 'SRO Haveli 4'
    },
    zoning: {
      parcelUlpin: 'MH-PUN-2024-224419',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Commercial', // DELIBERATE MISMATCH
      buildingPermissionStatus: 'Violation Notice Issued',
      floorAreaRatioAllowed: 2.0,
      maxBuildingHeightMeters: 15
    },
    encumbrance: {
      parcelUlpin: 'MH-PUN-2024-224419',
      hasMortgage: false,
      disputeFlag: true,
      disputeReason: 'Boundary overlap dispute with Survey 67/4 filed by adjacent ancestral co-sharers in Pune District Civil Court',
      courtCaseNumber: 'RCS/PUN/2022/819',
      stayOrderActive: true
    },
    tax: {
      parcelUlpin: 'MH-PUN-2024-224419',
      taxStatus: 'Outstanding',
      lastAssessedValueInr: 72000000,
      annualTaxDemandInr: 120000,
      propertyTaxAssessmentNo: 'PMC/PT/2024/224419'
    },
    utilities: {
      parcelUlpin: 'MH-PUN-2024-224419',
      electricityConsumerId: 'MSEDCL-BNR-9921',
      electricityDiscom: 'MSEDCL',
      waterSupplyConnectionId: 'PMC-WATER-5512',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 18
    }
  },
  {
    ulpin: 'MH-PUN-2024-231198',
    surveyNumber: '12/1',
    centroidLat: 18.5314,
    centroidLon: 73.8446, // Shivajinagar FC Road
    areaSqm: 880,
    areaAcres: 0.217,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(73.8446, 18.5314, 70, 75) },
    state: 'Maharashtra',
    district: 'Pune',
    subDistrictTaluk: 'Haveli',
    villageWard: 'Shivajinagar Ward 1',
    pincode: '411005',
    isMock: true,
    ownership: {
      parcelUlpin: 'MH-PUN-2024-231198',
      ownerName: 'Hemant Bhalchandra Gokhale',
      ownershipType: 'Freehold',
      registrationDate: '2012-03-14',
      registrationStatus: 'Registered',
      documentNumber: 'HVL/2012/1129',
      subRegistrarOffice: 'SRO Shivajinagar'
    },
    zoning: {
      parcelUlpin: 'MH-PUN-2024-231198',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.5,
      maxBuildingHeightMeters: 21
    },
    encumbrance: {
      parcelUlpin: 'MH-PUN-2024-231198',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'MH-PUN-2024-231198',
      taxStatus: 'Paid',
      lastAssessedValueInr: 52000000,
      annualTaxDemandInr: 89000,
      lastPaymentDate: '2024-05-09',
      propertyTaxAssessmentNo: 'PMC/PT/2024/231198'
    },
    utilities: {
      parcelUlpin: 'MH-PUN-2024-231198',
      electricityConsumerId: 'MSEDCL-SHV-0041',
      electricityDiscom: 'MSEDCL',
      waterSupplyConnectionId: 'PMC-WATER-3321',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 18
    }
  },

  // ================= LUCKNOW, UTTAR PRADESH (5 Parcels) =================
  {
    ulpin: 'UP-LKO-2024-301140',
    surveyNumber: '89/2',
    centroidLat: 26.8532,
    centroidLon: 80.9998, // Gomti Nagar Vibhuti Khand
    areaSqm: 1500,
    areaAcres: 0.371,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(80.9998, 26.8532, 85, 95) },
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    subDistrictTaluk: 'Lucknow Sadar',
    villageWard: 'Vibhuti Khand Ward 33',
    pincode: '226010',
    isMock: true,
    ownership: {
      parcelUlpin: 'UP-LKO-2024-301140',
      ownerName: 'Awadh Agro-Tech Solutions Pvt Ltd',
      ownershipType: 'Freehold',
      registrationDate: '2019-12-04',
      registrationStatus: 'Registered',
      documentNumber: 'LKO-S/2019/5501',
      subRegistrarOffice: 'SRO Lucknow Sadar II'
    },
    zoning: {
      parcelUlpin: 'UP-LKO-2024-301140',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.5,
      maxBuildingHeightMeters: 24
    },
    encumbrance: {
      parcelUlpin: 'UP-LKO-2024-301140',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'Punjab National Bank Gomti Nagar',
        loanAmountInr: 35000000,
        sanctionDate: '2020-03-12',
        chargeId: 'CHG-PNB-LKO-771'
      },
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'UP-LKO-2024-301140',
      taxStatus: 'Paid',
      lastAssessedValueInr: 49000000,
      annualTaxDemandInr: 72000,
      lastPaymentDate: '2024-04-28',
      propertyTaxAssessmentNo: 'LMC/PT/2024/301140'
    },
    utilities: {
      parcelUlpin: 'UP-LKO-2024-301140',
      electricityConsumerId: 'MVVNL-LKO-9921',
      electricityDiscom: 'Madhyanchal Vidyut Vitaran Nigam',
      waterSupplyConnectionId: 'LMC-JAL-0912',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 24
    }
  },
  {
    ulpin: 'UP-LKO-2024-309482',
    surveyNumber: '42/1',
    centroidLat: 26.8485,
    centroidLon: 80.9431, // Hazratganj MG Marg
    areaSqm: 920,
    areaAcres: 0.227,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(80.9431, 26.8485, 70, 75) },
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    subDistrictTaluk: 'Lucknow Sadar',
    villageWard: 'Hazratganj Ward 14',
    pincode: '226001',
    isMock: true,
    ownership: {
      parcelUlpin: 'UP-LKO-2024-309482',
      ownerName: 'Kunwar Raghavendra Pratap Singh',
      ownershipType: 'Freehold',
      registrationDate: '2001-08-19',
      registrationStatus: 'Registered',
      documentNumber: 'LKO-S/2001/104',
      subRegistrarOffice: 'SRO Lucknow Sadar I'
    },
    zoning: {
      parcelUlpin: 'UP-LKO-2024-309482',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.0,
      maxBuildingHeightMeters: 15
    },
    encumbrance: {
      parcelUlpin: 'UP-LKO-2024-309482',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'UP-LKO-2024-309482',
      taxStatus: 'Paid',
      lastAssessedValueInr: 62000000,
      annualTaxDemandInr: 95000,
      lastPaymentDate: '2024-05-02',
      propertyTaxAssessmentNo: 'LMC/PT/2024/309482'
    },
    utilities: {
      parcelUlpin: 'UP-LKO-2024-309482',
      electricityConsumerId: 'MVVNL-LKO-1102',
      electricityDiscom: 'MVVNL',
      waterSupplyConnectionId: 'LMC-JAL-5521',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 18
    }
  },
  {
    ulpin: 'UP-LKO-2024-315809',
    surveyNumber: '17/4B',
    centroidLat: 26.8912,
    centroidLon: 80.9521, // Aliganj Sector B
    areaSqm: 750,
    areaAcres: 0.185,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(80.9521, 26.8912, 60, 70) },
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    subDistrictTaluk: 'Lucknow Sadar',
    villageWard: 'Aliganj Ward 22',
    pincode: '226024',
    isMock: true,
    ownership: {
      parcelUlpin: 'UP-LKO-2024-315809',
      ownerName: 'Smt. Kamla Devi Tiwari',
      ownershipType: 'Freehold',
      registrationDate: '2013-05-16',
      registrationStatus: 'Registered',
      documentNumber: 'LKO-S/2013/3392',
      subRegistrarOffice: 'SRO Lucknow Sadar III'
    },
    zoning: {
      parcelUlpin: 'UP-LKO-2024-315809',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Residential',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 1.8,
      maxBuildingHeightMeters: 12
    },
    encumbrance: {
      parcelUlpin: 'UP-LKO-2024-315809',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'UP-LKO-2024-315809',
      taxStatus: 'Paid',
      lastAssessedValueInr: 22000000,
      annualTaxDemandInr: 28000,
      lastPaymentDate: '2024-04-10',
      propertyTaxAssessmentNo: 'LMC/PT/2024/315809'
    },
    utilities: {
      parcelUlpin: 'UP-LKO-2024-315809',
      electricityConsumerId: 'MVVNL-LKO-4401',
      electricityDiscom: 'MVVNL',
      waterSupplyConnectionId: 'LMC-JAL-8891',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 12
    }
  },
  {
    ulpin: 'UP-LKO-2024-322199',
    surveyNumber: '155/1',
    centroidLat: 26.8741,
    centroidLon: 80.9902, // Indira Nagar Ring Road
    areaSqm: 1350,
    areaAcres: 0.334,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(80.9902, 26.8741, 80, 90) },
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    subDistrictTaluk: 'Lucknow Sadar',
    villageWard: 'Indira Nagar Ward 29',
    pincode: '226016',
    isMock: true,
    ownership: {
      parcelUlpin: 'UP-LKO-2024-322199',
      ownerName: 'Surendra Kumar Awasthi',
      ownershipType: 'Freehold',
      registrationDate: '2016-10-11',
      registrationStatus: 'Under Objection',
      documentNumber: 'LKO-S/2016/9941',
      subRegistrarOffice: 'SRO Lucknow Sadar II'
    },
    zoning: {
      parcelUlpin: 'UP-LKO-2024-322199',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Commercial', // DELIBERATE MISMATCH
      buildingPermissionStatus: 'Violation Notice Issued',
      floorAreaRatioAllowed: 1.75,
      maxBuildingHeightMeters: 12
    },
    encumbrance: {
      parcelUlpin: 'UP-LKO-2024-322199',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'Bank of Baroda Indira Nagar',
        loanAmountInr: 16000000,
        sanctionDate: '2018-06-22',
        chargeId: 'CHG-BOB-LKO-119'
      },
      disputeFlag: true,
      disputeReason: 'Lucknow Development Authority (LDA) demolition notice for unauthorized commercial showroom on designated residential layout',
      courtCaseNumber: 'LDA/ENF/2023/441',
      stayOrderActive: false
    },
    tax: {
      parcelUlpin: 'UP-LKO-2024-322199',
      taxStatus: 'Outstanding',
      lastAssessedValueInr: 36000000,
      annualTaxDemandInr: 78000,
      propertyTaxAssessmentNo: 'LMC/PT/2024/322199'
    },
    utilities: {
      parcelUlpin: 'UP-LKO-2024-322199',
      electricityConsumerId: 'MVVNL-LKO-6612',
      electricityDiscom: 'MVVNL',
      waterSupplyConnectionId: 'LMC-JAL-3310',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 18
    }
  },
  {
    ulpin: 'UP-LKO-2024-331024',
    surveyNumber: '78/2',
    centroidLat: 26.8682,
    centroidLon: 80.9510, // Mahanagar Gole Market
    areaSqm: 640,
    areaAcres: 0.158,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(80.9510, 26.8682, 55, 65) },
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    subDistrictTaluk: 'Lucknow Sadar',
    villageWard: 'Mahanagar Ward 18',
    pincode: '226006',
    isMock: true,
    ownership: {
      parcelUlpin: 'UP-LKO-2024-331024',
      ownerName: 'Virendra Mohan Saxena',
      ownershipType: 'Freehold',
      registrationDate: '2010-01-20',
      registrationStatus: 'Registered',
      documentNumber: 'LKO-S/2010/881',
      subRegistrarOffice: 'SRO Lucknow Sadar I'
    },
    zoning: {
      parcelUlpin: 'UP-LKO-2024-331024',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Residential',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 1.8,
      maxBuildingHeightMeters: 12
    },
    encumbrance: {
      parcelUlpin: 'UP-LKO-2024-331024',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'UP-LKO-2024-331024',
      taxStatus: 'Paid',
      lastAssessedValueInr: 24000000,
      annualTaxDemandInr: 31000,
      lastPaymentDate: '2024-05-11',
      propertyTaxAssessmentNo: 'LMC/PT/2024/331024'
    },
    utilities: {
      parcelUlpin: 'UP-LKO-2024-331024',
      electricityConsumerId: 'MVVNL-LKO-7711',
      electricityDiscom: 'MVVNL',
      waterSupplyConnectionId: 'LMC-JAL-4491',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 12
    }
  },

  // ================= AHMEDABAD, GUJARAT (5 Parcels) =================
  {
    ulpin: 'GJ-AHM-2024-401928',
    surveyNumber: '409/2',
    centroidLat: 23.0372,
    centroidLon: 72.5121, // Bodakdev SG Highway
    areaSqm: 2100,
    areaAcres: 0.519,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(72.5121, 23.0372, 95, 115) },
    state: 'Gujarat',
    district: 'Ahmedabad',
    subDistrictTaluk: 'Ghatlodiya',
    villageWard: 'Bodakdev Ward 15',
    pincode: '380054',
    isMock: true,
    ownership: {
      parcelUlpin: 'GJ-AHM-2024-401928',
      ownerName: 'Pravinbhai Kanjibhai Patel',
      coOwners: ['Varshaben Pravinbhai Patel'],
      ownershipType: 'Freehold',
      registrationDate: '2019-03-24',
      registrationStatus: 'Registered',
      documentNumber: 'GHT/2019/3318',
      subRegistrarOffice: 'SRO Ghatlodiya'
    },
    zoning: {
      parcelUlpin: 'GJ-AHM-2024-401928',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 3.0,
      maxBuildingHeightMeters: 30
    },
    encumbrance: {
      parcelUlpin: 'GJ-AHM-2024-401928',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'Kotak Mahindra Bank Ahmedabad Corporate',
        loanAmountInr: 65000000,
        sanctionDate: '2020-09-14',
        chargeId: 'CHG-KMB-AHM-991'
      },
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'GJ-AHM-2024-401928',
      taxStatus: 'Paid',
      lastAssessedValueInr: 95000000,
      annualTaxDemandInr: 160000,
      lastPaymentDate: '2024-04-15',
      propertyTaxAssessmentNo: 'AMC/PT/2024/401928'
    },
    utilities: {
      parcelUlpin: 'GJ-AHM-2024-401928',
      electricityConsumerId: 'TORRENT-W-8821',
      electricityDiscom: 'Torrent Power Ltd',
      waterSupplyConnectionId: 'AMC-WATER-9921',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 30
    }
  },
  {
    ulpin: 'GJ-AHM-2024-408819',
    surveyNumber: '88/1',
    centroidLat: 23.0360,
    centroidLon: 72.5614, // Navrangpura CG Road
    areaSqm: 1250,
    areaAcres: 0.309,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(72.5614, 23.0360, 80, 88) },
    state: 'Gujarat',
    district: 'Ahmedabad',
    subDistrictTaluk: 'Sabarmati',
    villageWard: 'Navrangpura Ward 10',
    pincode: '380009',
    isMock: true,
    ownership: {
      parcelUlpin: 'GJ-AHM-2024-408819',
      ownerName: 'Dhanraj Mangaldas Sheth',
      ownershipType: 'Freehold',
      registrationDate: '2005-04-18',
      registrationStatus: 'Registered',
      documentNumber: 'SBM/2005/1190',
      subRegistrarOffice: 'SRO Ahmedabad Central'
    },
    zoning: {
      parcelUlpin: 'GJ-AHM-2024-408819',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.5,
      maxBuildingHeightMeters: 22
    },
    encumbrance: {
      parcelUlpin: 'GJ-AHM-2024-408819',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'GJ-AHM-2024-408819',
      taxStatus: 'Paid',
      lastAssessedValueInr: 68000000,
      annualTaxDemandInr: 110000,
      lastPaymentDate: '2024-05-19',
      propertyTaxAssessmentNo: 'AMC/PT/2024/408819'
    },
    utilities: {
      parcelUlpin: 'GJ-AHM-2024-408819',
      electricityConsumerId: 'TORRENT-C-4412',
      electricityDiscom: 'Torrent Power',
      waterSupplyConnectionId: 'AMC-WATER-4418',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 24
    }
  },
  {
    ulpin: 'GJ-AHM-2024-415590',
    surveyNumber: '219/3',
    centroidLat: 23.0182,
    centroidLon: 72.5284, // Satellite Prernatirth Derasar Road
    areaSqm: 890,
    areaAcres: 0.220,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(72.5284, 23.0182, 68, 75) },
    state: 'Gujarat',
    district: 'Ahmedabad',
    subDistrictTaluk: 'Vejalpur',
    villageWard: 'Satellite Ward 18',
    pincode: '380015',
    isMock: true,
    ownership: {
      parcelUlpin: 'GJ-AHM-2024-415590',
      ownerName: 'Bhavnaben Harshadbhai Shah',
      ownershipType: 'Freehold',
      registrationDate: '2016-08-30',
      registrationStatus: 'Registered',
      documentNumber: 'VJL/2016/5521',
      subRegistrarOffice: 'SRO Vejalpur'
    },
    zoning: {
      parcelUlpin: 'GJ-AHM-2024-415590',
      masterPlanClassification: 'Residential',
      registeredLandUse: 'Residential',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.2,
      maxBuildingHeightMeters: 18
    },
    encumbrance: {
      parcelUlpin: 'GJ-AHM-2024-415590',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'GJ-AHM-2024-415590',
      taxStatus: 'Paid',
      lastAssessedValueInr: 39000000,
      annualTaxDemandInr: 45000,
      lastPaymentDate: '2024-04-25',
      propertyTaxAssessmentNo: 'AMC/PT/2024/415590'
    },
    utilities: {
      parcelUlpin: 'GJ-AHM-2024-415590',
      electricityConsumerId: 'TORRENT-W-5501',
      electricityDiscom: 'Torrent Power',
      waterSupplyConnectionId: 'AMC-WATER-7729',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 15
    }
  },
  {
    ulpin: 'GJ-AHM-2024-423188',
    surveyNumber: '14/2',
    centroidLat: 23.0560,
    centroidLon: 72.5029, // Thaltej Science City Road
    areaSqm: 3800,
    areaAcres: 0.939,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(72.5029, 23.0560, 115, 135) },
    state: 'Gujarat',
    district: 'Ahmedabad',
    subDistrictTaluk: 'Ghatlodiya',
    villageWard: 'Thaltej Ward 14',
    pincode: '380059',
    isMock: true,
    ownership: {
      parcelUlpin: 'GJ-AHM-2024-423188',
      ownerName: 'Gujarat State Urban Dev Co (GSUDA)',
      ownershipType: 'Government',
      registrationDate: '2011-10-10',
      registrationStatus: 'Registered',
      documentNumber: 'GHT/2011/900',
      subRegistrarOffice: 'SRO Ghatlodiya'
    },
    zoning: {
      parcelUlpin: 'GJ-AHM-2024-423188',
      masterPlanClassification: 'Public Utility',
      registeredLandUse: 'Public Utility',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 2.0,
      maxBuildingHeightMeters: 18
    },
    encumbrance: {
      parcelUlpin: 'GJ-AHM-2024-423188',
      hasMortgage: false,
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'GJ-AHM-2024-423188',
      taxStatus: 'Exempt',
      lastAssessedValueInr: 120000000,
      annualTaxDemandInr: 0,
      propertyTaxAssessmentNo: 'AMC/GOV/2024/007'
    },
    utilities: {
      parcelUlpin: 'GJ-AHM-2024-423188',
      electricityConsumerId: 'TORRENT-PUB-012',
      electricityDiscom: 'Torrent Power',
      waterSupplyConnectionId: 'AMC-BULK-33',
      pipelineGasStatus: 'Available',
      roadAccessWidthMeters: 36
    }
  },
  {
    ulpin: 'GJ-AHM-2024-431902',
    surveyNumber: '61/1',
    centroidLat: 23.0118,
    centroidLon: 72.4889, // Prahlad Nagar Anand Nagar Road
    areaSqm: 1720,
    areaAcres: 0.425,
    boundaryGeojson: { type: 'Polygon', coordinates: makePolygon(72.4889, 23.0118, 90, 100) },
    state: 'Gujarat',
    district: 'Ahmedabad',
    subDistrictTaluk: 'Vejalpur',
    villageWard: 'Vejalpur Prahlad Nagar',
    pincode: '380015',
    isMock: true,
    ownership: {
      parcelUlpin: 'GJ-AHM-2024-431902',
      ownerName: 'Nirav Jashwantlal Mehta',
      ownershipType: 'Freehold',
      registrationDate: '2017-06-18',
      registrationStatus: 'Registered',
      documentNumber: 'VJL/2017/7702',
      subRegistrarOffice: 'SRO Vejalpur'
    },
    zoning: {
      parcelUlpin: 'GJ-AHM-2024-431902',
      masterPlanClassification: 'Commercial',
      registeredLandUse: 'Commercial',
      buildingPermissionStatus: 'Approved',
      floorAreaRatioAllowed: 3.2,
      maxBuildingHeightMeters: 30
    },
    encumbrance: {
      parcelUlpin: 'GJ-AHM-2024-431902',
      hasMortgage: true,
      mortgageDetails: {
        lenderName: 'Federal Bank Prahlad Nagar',
        loanAmountInr: 42000000,
        sanctionDate: '2018-09-02',
        chargeId: 'CHG-FBL-AHM-770'
      },
      disputeFlag: false
    },
    tax: {
      parcelUlpin: 'GJ-AHM-2024-431902',
      taxStatus: 'Paid',
      lastAssessedValueInr: 82000000,
      annualTaxDemandInr: 135000,
      lastPaymentDate: '2024-05-14',
      propertyTaxAssessmentNo: 'AMC/PT/2024/431902'
    },
    utilities: {
      parcelUlpin: 'GJ-AHM-2024-431902',
      electricityConsumerId: 'TORRENT-W-9904',
      electricityDiscom: 'Torrent Power',
      waterSupplyConnectionId: 'AMC-WATER-6612',
      pipelineGasStatus: 'Connected',
      roadAccessWidthMeters: 24
    }
  }
];
