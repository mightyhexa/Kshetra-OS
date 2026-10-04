export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  available: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', available: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', available: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', available: true },
  { code: 'bn' as any, name: 'Bengali', nativeName: 'বাংলা (শীঘ্রই আসছে)', available: false },
  { code: 'mr' as any, name: 'Marathi', nativeName: 'मराठी (लवकरच)', available: false },
  { code: 'ta' as any, name: 'Tamil', nativeName: 'தமிழ் (விரைவில்)', available: false },
  { code: 'gu' as any, name: 'Gujarati', nativeName: 'ગુજરાતી (ટૂંક સમયમાં)', available: false },
  { code: 'ml' as any, name: 'Malayalam', nativeName: 'മലയാളം (உடನ್)', available: false },
  { code: 'pa' as any, name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ (ਜਲਦੀ)', available: false },
  { code: 'or' as any, name: 'Odia', nativeName: 'ଓଡ଼ିଆ (শীঘ্ৰ)', available: false }
];

export interface TranslationSchema {
  // App & Shell
  appTitle: string;
  appSubtitle: string;
  prototypeNotice: string;
  prototypeBadge: string;
  skipToContent: string;
  
  // Navigation
  navCadastre: string;
  navCitizenServices: string;
  navOfficerConsole: string;
  navAnalytics: string;
  navAuditLedger: string;
  navVerifyDoc: string;
  navApiConsole: string;
  navSpecs: string;
  
  // Roles
  roleCitizen: string;
  roleOfficer: string;
  roleAdmin: string;
  roleSwitchTo: string;
  roleActive: string;
  
  // Login Screen
  loginHeroTitle: string;
  loginHeroDesc: string;
  loginTabQuickRole: string;
  loginTabAadhaar: string;
  loginTabSso: string;
  loginCitizenCanSee: string;
  loginCitizenCannotSee: string;
  loginOfficerCanSee: string;
  loginOfficerCannotSee: string;
  loginAdminCanSee: string;
  loginAdminCannotSee: string;
  loginEnterPortal: string;
  loginSimulatedNotice: string;
  
  // Accessibility & UI Controls
  fontSizeDecrease: string;
  fontSizeNormal: string;
  fontSizeIncrease: string;
  highContrastToggle: string;
  selectLanguage: string;
  comingSoon: string;
  copied: string;
  copyUlpin: string;
  copyHash: string;
  
  // Search, Filters & Map Layers
  searchPlaceholder: string;
  filterMetro: string;
  allIndia: string;
  filterDisputed: string;
  filterFlagged: string;
  filterAll: string;
  showingResults: string;
  noParcelsFound: string;
  mapLayerBoundaries: string;
  mapLayerZoning: string;
  mapLayerOwnership: string;
  mapLayerCourtDisputes: string;
  mapLayerEcoBuffer: string;
  mapLayerOverlapEvidence: string;
  mapFilterDrawerTitle: string;
  mapLegendTitle: string;
  mapActiveFiltersCount: string;
  mapCrsTitle: string;
  mapCrsAdvanced: string;
  
  // Parcel Details Panel & Tabs
  parcelDetailsTitle: string;
  tabOverview: string;
  tabOwnership: string;
  tabEncumbrance: string;
  tabZoningTax: string;
  tabActivity: string;
  actionPartition: string;
  actionSatelliteChange: string;
  ruleDetailsAccordion: string;
  ruleTriggerFields: string;
  ruleResponsibleOffice: string;
  ruleShowOnMap: string;
  ulpinLabel: string;
  surveyNumberLabel: string;
  areaLabel: string;
  coordinatesLabel: string;
  districtLabel: string;
  stateLabel: string;
  villageWardLabel: string;
  ownerNameLabel: string;
  registrationDateLabel: string;
  landUseLabel: string;
  zoningCategoryLabel: string;
  propertyTaxLabel: string;
  taxStatusPaid: string;
  taxStatusArrears: string;
  taxAssessmentYear: string;
  
  // Encumbrance & Privacy
  encumbranceSection: string;
  disputeTitle: string;
  disputeActive: string;
  disputeNone: string;
  stayOrderActive: string;
  stayOrderNone: string;
  courtDocketProtected: string;
  mortgageSection: string;
  mortgageActive: string;
  mortgageNone: string;
  bankingDetailsProtected: string;
  cersaiChargesSection: string;
  cersaiChargesProtected: string;
  
  // Risk Engine Findings
  riskAnalysisTitle: string;
  ruleFindingsCount: string;
  severityClear: string;
  severityAmber: string;
  severityRose: string;
  severityInfo: string;
  riskStatusPristine: string;
  riskStatusWarning: string;
  riskStatusFatal: string;
  
  // Risk Rules Translated Templates
  ruleR1Title: string;
  ruleR1Desc: string;
  ruleR2OverlapTitle: string;
  ruleR2OverlapDesc: string;
  ruleR2ToleranceTitle: string;
  ruleR2ToleranceDesc: string;
  ruleR3EcoBufferTitle: string;
  ruleR3EcoBufferDesc: string;
  ruleR4ZoningMismatchTitle: string;
  ruleR4ZoningMismatchDesc: string;
  ruleR5FarTitle: string;
  ruleR5FarDesc: string;
  ruleR6DuplicateSaleTitle: string;
  ruleR6DuplicateSaleDesc: string;
  ruleR7LienTitle: string;
  ruleR7LienDesc: string;
  ruleR8TaxTitle: string;
  ruleR8TaxDesc: string;
  ruleR9LineageTitle: string;
  ruleR9LineageDesc: string;
  
  // Stage 4B: Citizen Services & Officer Console & Analytics
  citizenServicesTitle: string;
  citizenServicesSubtitle: string;
  applyNewService: string;
  selectServiceType: string;
  selectParcel: string;
  remarksLabel: string;
  uploadEvidenceFile: string;
  myApplications: string;
  officerConsoleTitle: string;
  officerConsoleSubtitle: string;
  kpiParcelsIndexed: string;
  kpiCourtDisputes: string;
  kpiHighFlags: string;
  kpiTotalFlags: string;
  kpiAvgTurnaround: string;
  workflowQueueTitle: string;
  riskRegistryTitle: string;
  authorizeTransition: string;
  analyticsTitle: string;
  analyticsSubtitle: string;
  runSystemCheck: string;
  roleRestrictedTitle: string;
  roleRestrictedOfficer: string;
  roleRestrictedAdmin: string;
  
  // Actions
  actionPreviewDossier: string;
  actionDownloadPdf: string;
  actionForm15: string;
  actionApplyMutation: string;
  actionVerifyIntegrity: string;
  actionTamperDemo: string;
  actionResetLedger: string;
  actionExportJson: string;
  actionUploadDocument: string;
  actionClose: string;
  actionSubmit: string;
  actionCancel: string;
  actionRetry: string;
  
  // Workflow States
  statusApplied: string;
  statusUnderReview: string;
  statusCrossVerified: string;
  statusApproved: string;
  statusRejected: string;
  
  // Audit Ledger
  ledgerTitle: string;
  ledgerSubtitle: string;
  ledgerBlockIndex: string;
  ledgerAction: string;
  ledgerActor: string;
  ledgerTimestamp: string;
  ledgerDetails: string;
  ledgerHash: string;
  ledgerPrevHash: string;
  ledgerChainValid: string;
  ledgerChainCorrupted: string;
  ledgerVerifiedCount: string;
  ledgerBrokenAtBlock: string;
  
  // Verification
  verifyDocumentTitle: string;
  verifyDocumentSubtitle: string;
  verifyUploadDropzone: string;
  verifyMatchSuccess: string;
  verifyMatchFailed: string;
  verifyMatchBlockDetails: string;

  // Stage 4 Labels
  chartParcelsByCity: string;
  chartRequestFunnel: string;
  chartTurnaroundTrend: string;
  liveRiskEngine: string;
  statutorySlaCompliance: string;
  downloadCertificate: string;
  receiptHash: string;

  // Common Table & UI Labels
  tableHeaderAppId: string;
  tableHeaderServiceType: string;
  tableHeaderStatus: string;
  tableHeaderAction: string;
  reviewAction: string;
  finalizedStatus: string;
  authorizedNextWorkflowState: string;
  provableAnomalies: string;
  ruleTitleLabel: string;
  plainLanguageFinding: string;
  realTimeSla: string;
  liveSync: string;
  filterLayers: string;
  basemapProvider: string;
  computedDigest: string;
  ledgerAnchoredBlock: string;
  sroOfficeLabel: string;
  landUseResidential: string;
  landUseCommercial: string;
  landUseIndustrial: string;
  resetFilters: string;
  clickBlockToInspect: string;
  adminTamperToolsLocked: string;
  anchoredPayloadMetadata: string;
  
  // Extended UI Labels for Hardening
  civilCourtInjunction: string;
  ruleFlags: string;
  pristineRecord: string;
  activeInjunction: string;
  none: string;
  civilCourt: string;
  allRulesPassedZeroViolations: string;
  triggeredFields: string;
  responsibleOffice: string;
  primaryTitleHolder: string;
  jointCoOwners: string;
  verifiedCoOwner: string;
  jointShare: string;
  soleProprietorshipRecord: string;
  coOwnerPrivacyNotice: string;
  activeLien: string;
  clearTitle: string;
  clean: string;
  masterPlanZoningTitle: string;
  centroidCoordinates: string;
  stateCode: string;
  assessmentPid: string;
  annualTaxDemand: string;
  lastPaymentReceipt: string;
  auditTrailForParcel: string;
  queryingLedger: string;
  noLedgerActivity: string;
  actor: string;
  filterDrawerSubtitle: string;
  anomalyLegalFilters: string;
  parcelsWithStayOrders: string;
  parcelsWithRuleFlags: string;
  zoningClassification: string;
  allZonalMasterPlans: string;
  applyBtn: string;
  actionAcknowledge: string;
  closeBtn: string;
  subdivisionTitle: string;
  subdivisionSubtitle: string;
  tahsildarModule: string;
  subdivisionSuccessTitle: string;
  subdivisionSuccessDesc: string;
  childParcel1: string;
  childParcel2: string;
  returnToMap: string;
  parentSurveyNo: string;
  parentUlpin: string;
  totalCadastralExtent: string;
  subdivisionRatio: string;
  demarcationCutLine: string;
  apiInspectorTitle: string;
  apiInspectorSubtitle: string;
  targetParcel: string;
  certificateDocketNumber: string;
  printView: string;
  downloadPdfFile: string;

  // Technical Document Modal
  techDocTitle: string;
  techDocSubtitle: string;
  techDocTabApi: string;
  techDocTabInterop: string;
  techDocTabSchemas: string;
  techDocTabArch: string;
  techDocTabGis: string;
  techDocTabSecurity: string;
  techDocTabUiux: string;
  techDocTabDeployment: string;
  downloadSpecMd: string;
  techSpecEnglishNotice: string;

  // Features Roadmap Modal
  roadmapTitle: string;
  roadmapSubtitle: string;
  roadmapTabWorking: string;
  roadmapTabRoadmap: string;
  roadmapTabArch: string;

  // Login Page UI
  loginBtn: string;
  loginSubtitle: string;
  aadhaarIdentifierLabel: string;
  requestOtpBtn: string;
  simulatedOtpLabel: string;
  validFor10Min: string;
  ekycOtpLabel: string;
  authWithAadhaarBtn: string;
  ssoBadgeLabel: string;
  ssoAuthorityLabel: string;
  ssoOfficerOption: string;
  ssoAdminOption: string;
  verifySsoBtn: string;
  viewSpecifications: string;

  // Government Dossier Modal & Certificate
  dossierModalTitle: string;
  tamperEvidentStandard: string;
  officialDpiSubtitle: string;
  generatingPdf: string;
  downloadOfficialPdf: string;
  certGeneratorTitle: string;
  certGeneratorSubtitle: string;

  // API Inspector Modal
  securityPolicyApplied: string;
  privilegedClearance: string;
  copyJson: string;
  queryingBackend: string;

  // Audit Ledger & Document Verification
  verificationSucceeded: string;
  tamperDetected: string;
  verificationError: string;
  tamperSimulated: string;
  simulationError: string;
  ledgerRestored: string;
  resetError: string;
  exportComplete: string;
  searchLedgerPlaceholder: string;
  uploadDossierTitle: string;
  uploadDossierHint: string;
  verifyMatchSuccessDesc: string;
  verifyMatchFailedDesc: string;

  // Navbar & Notifications
  aboutPrototype: string;
  startGuidedDemo: string;
  eventStreamTitle: string;
  newNotifications: string;
  markAllRead: string;
  noNotifications: string;
  clearAll: string;
  notificationsTooltip: string;

  // Footer
  footerDisclaimer: string;
  footerAccessibility: string;
  footerPrivacy: string;
  footerTerms: string;
  footerContact: string;
  footerBuildVersion: string;
  footerGovernmentHackathonNotice: string;

  // Extended Footer Modals
  footerAccessibilitySubtitle: string;
  footerCommitmentTitle: string;
  footerCommitmentDesc: string;
  footerConformanceMeasures: string;
  footerTypographyHierarchy: string;
  footerTypographyDesc: string;
  footerFontScaling: string;
  footerFontScalingDesc: string;
  footerHighContrast: string;
  footerHighContrastDesc: string;
  footerDualCodedSignals: string;
  footerDualCodedDesc: string;
  footerScreenReaderLive: string;
  footerScreenReaderDesc: string;
  footerPrivacySubtitle: string;
  footerSyntheticDataTitle: string;
  footerSyntheticDataDesc: string;
  footerPrivacyGuarantees: string;
  footerPrivacyItem1: string;
  footerPrivacyItem2: string;
  footerPrivacyItem3: string;
  footerTermsSubtitle: string;
  footerTermsDesc1: string;
  footerTermsDesc2: string;
  footerContactSubtitle: string;
  footerLeadContact: string;

  // Extended Login Page
  bhuAadhaarStructure: string;
  districtTahsil: string;
  villageSheet: string;
  plotChecksum: string;
  simulatedDpiPortal: string;
  citizenDemoName: string;
  officerDemoName: string;
  adminDemoName: string;

  // Extended Government Dossier & Certificate
  print: string;
  closePreview: string;
  scanToVerify: string;
  activeJudicialStayOrder: string;
  verifiedCadastreStatus: string;
  cadastralVerificationStatus: string;
  bhuAadhaarFullName: string;
  geodeticLayer1Title: string;
  surveyKhasraNo: string;
  registeredExtent: string;
  talukSubDistrict: string;
  rorLayer2Title: string;
  coSharersHeirs: string;
  noneRecordedSole: string;
  conveyanceDeedNo: string;
  registrationDateSro: string;
  zoningLayer3Title: string;
  buildingPermission: string;
  bankEncumbranceCharge: string;
  activeMortgageDisclosed: string;
  cleanTitleNil: string;
  fiscalLayer4Title: string;
  taxStatusDemand: string;
  electricityConsumerId: string;
  roadAccessRowWidth: string;
  publicArterialRow: string;
  cadastralRiskAnomalies: string;
  digitallySignedNsdi: string;
  competentRevenueAuthority: string;
  deptLandRecordsSurvey: string;
  electronicSignatureVerified: string;
  dateOfCertification: string;
  recordedTitleHolder: string;
  tenureType: string;
  conveyanceInstrumentNo: string;
  subRegistrarOfficeLabel: string;
  encumbranceVerificationFinding: string;
  activeChargeDisclosed: string;
  cleanTitleNilFound: string;
  digitallySealedKshetra: string;
  digitallySignedTahsildar: string;
  deptLandResourcesGoI: string;

  // Extended Roadmap & Navbar & Inspector
  winningTierBadge: string;
  closeMatrix: string;
  operationalInBuild: string;
  operationalInBuildDesc: string;
  aboutModalTitle: string;
  aboutModalSubtitle: string;
  aboutProblemStatement: string;
  aboutUlpinDesc: string;
  aboutLedgerDesc: string;
  highContrastBtn: string;
  logoutSession: string;
  serviceErrorDefault: string;
  retryOperation: string;
  userProfileTitle: string;
  userProfileSubtitle: string;
  profileRoleElevation: string;
  fullNameLabel: string;
  aadhaarIdLabel: string;
  officialEmailLabel: string;
  mobilePhoneLabel: string;
  designatedDistrictLabel: string;
  designatedStateLabel: string;
  twoFactorAuthLabel: string;
  twoFactorAuthDesc: string;
  activeBearerTokenLabel: string;
  copyTokenBtn: string;
  saveProfileChangesBtn: string;
  switchAccountSignOut: string;
  profileUpdatedSuccess: string;
  district: string;
  registeredLandUse: string;
  roleCitizenDesc: string;
  roleOfficerDesc: string;
  roleAdminDesc: string;
}
