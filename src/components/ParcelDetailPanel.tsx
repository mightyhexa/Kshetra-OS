import React, { useState, useEffect } from 'react';
import { Parcel, ParcelRiskFlag, UserRole, AuditLedgerEntry } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { computeParcelFlags } from '../services/riskEngine';
import { downloadServerDossierPdf } from '../services/pdfReportGenerator';
import { apiClient } from '../services/apiClient';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { Tabs } from './ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { PlotTag } from './ui/PlotTag';
import { CopyHashPill } from './ui/CopyHashPill';
import { 
  X, 
  Download, 
  Eye, 
  MoreVertical, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  FileText, 
  Scale, 
  Building2, 
  Receipt, 
  Clock, 
  Database,
  ArrowRight,
  Layers
} from 'lucide-react';

interface ParcelDetailPanelProps {
  parcel: Parcel | null;
  userRole: UserRole;
  onClose: () => void;
  onInitiateServiceRequest: (ulpin: string) => void;
  onOpenApiInspector?: () => void;
  onGenerateCertificate: (parcel: Parcel) => void;
  onOpenVoiceAssistant?: (parcel: Parcel) => void;
  onOpenSubdivision?: (parcel: Parcel) => void;
  onOpenChangeDetection?: (parcel: Parcel) => void;
  onOpenTitleScore?: (parcel: Parcel) => void;
  onOpenDossier?: (parcel: Parcel) => void;
}

export const ParcelDetailPanel: React.FC<ParcelDetailPanelProps> = ({
  parcel,
  userRole,
  onClose,
  onInitiateServiceRequest,
  onOpenApiInspector: _onOpenApiInspector,
  onGenerateCertificate,
  onOpenVoiceAssistant: _onOpenVoiceAssistant,
  onOpenSubdivision,
  onOpenChangeDetection,
  onOpenTitleScore: _onOpenTitleScore,
  onOpenDossier
}) => {
  const { t, tRule } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'ror' | 'encumbrance' | 'zoning' | 'activity'>('overview');
  const [expandedFlagIndex, setExpandedFlagIndex] = useState<number | null>(0);
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [parcelLedgerBlocks, setParcelLedgerBlocks] = useState<AuditLedgerEntry[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  // Load ledger blocks for parcel
  useEffect(() => {
    if (!parcel || activeTab !== 'activity') return;
    async function loadParcelActivity() {
      setIsLoadingLedger(true);
      try {
        const blocks = await apiClient.getLedger(parcel?.ulpin);
        setParcelLedgerBlocks(blocks);
      } catch (err) {
        console.error('Failed to load parcel ledger blocks:', err);
      } finally {
        setIsLoadingLedger(false);
      }
    }
    loadParcelActivity();
  }, [parcel, activeTab]);

  if (!parcel) return null;

  const isOfficerOrAdmin = userRole === 'officer' || userRole === 'policy_admin';
  const flags: ParcelRiskFlag[] = computeParcelFlags(parcel);
  const isDisputed = parcel.encumbrance.disputeFlag;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadServerDossierPdf(parcel, userRole);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 z-40 w-full sm:max-w-xl md:max-w-2xl bg-white shadow-2xl border-l border-[#CBD5E1] flex flex-col transform transition-transform duration-200 ease-in-out"
      role="region"
      aria-labelledby="parcel-panel-title"
    >
      {/* 1. Header with ULPIN Chip, Status Chip, Primary & Secondary Actions */}
      <div className="p-4 sm:p-5 bg-[#F8FAFC] border-b border-[#E2E8F0] shrink-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <PlotTag ulpin={parcel.ulpin} size="sm" />
              <Chip
                size="sm"
                severity={isDisputed ? 'court' : flags.length > 0 ? 'amber' : 'clear'}
                label={isDisputed ? t('civilCourtInjunction') : flags.length > 0 ? `${flags.length} ${t('ruleFlags')}` : t('pristineRecord')}
              />
            </div>
            <h2 id="parcel-panel-title" className="font-serif text-lg font-bold text-[#0F172A] mt-1.5">
              {t('surveyNumberLabel')} {parcel.surveyNumber} · {parcel.villageWard}
            </h2>
            <p className="text-xs text-[#64748B]">
              {parcel.district}, {parcel.state} — PIN {parcel.pinCode || parcel.pincode}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B3D6E]"
            aria-label="Close parcel details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header Strip: Primary Download Dossier, Preview & Overflow */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Primary Action Button: Download Dossier PDF */}
            <Button
              variant="primary"
              size="sm"
              isLoading={isDownloading}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadPdf}
            >
              {t('actionDownloadPdf')}
            </Button>

            {/* Secondary Action: Preview */}
            {onOpenDossier && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
                onClick={() => onOpenDossier(parcel)}
              >
                {t('actionPreviewDossier')}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Initiate Service Request CTA */}
            <Button
              variant="saffron"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => onInitiateServiceRequest(parcel.ulpin)}
            >
              {t('actionApplyMutation')}
            </Button>

            {/* Overflow Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsOverflowMenuOpen(!isOverflowMenuOpen)}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-colors focus:outline-none cursor-pointer"
                aria-label="More tools"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isOverflowMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      onGenerateCertificate(parcel);
                      setIsOverflowMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#0B3D6E]" />
                    <span>{t('actionForm15')}</span>
                  </button>

                  {onOpenSubdivision && (
                    <button
                      onClick={() => {
                        onOpenSubdivision(parcel);
                        setIsOverflowMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t('actionPartition')}</span>
                    </button>
                  )}

                  {onOpenChangeDetection && (
                    <button
                      onClick={() => {
                        onOpenChangeDetection(parcel);
                        setIsOverflowMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('actionSatelliteChange')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 5 Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: t('tabOverview') },
          { id: 'ror', label: t('tabOwnership') },
          { id: 'encumbrance', label: t('tabEncumbrance') },
          { id: 'zoning', label: t('tabZoningTax') },
          { id: 'activity', label: t('tabActivity'), badge: parcelLedgerBlocks.length || undefined }
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        className="px-4 bg-white shrink-0"
      />

      {/* 3. Tab Body (Scrollable, Progressive Disclosure) */}
      <div className="grow overflow-y-auto p-5 space-y-5 text-xs text-[#334155]">
        {/* TAB 1: OVERVIEW & RISKS */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('areaLabel')}</span>
                <span className="font-serif text-sm font-bold text-[#0F172A]">{parcel.areaSqm} m²</span>
                <span className="text-[10px] text-slate-400 block">{parcel.areaAcres} Acres</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('landUseLabel')}</span>
                <span className="font-semibold text-[#0F172A] truncate block">{parcel.zoning?.registeredLandUse || 'Residential'}</span>
                <span className="text-[10px] text-slate-400 block">Zoning: {parcel.zoning?.masterPlanClassification || 'Zonal'}</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('disputeTitle')}</span>
                <span className={`font-semibold ${isDisputed ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isDisputed ? t('activeInjunction') : t('none')}
                </span>
                <span className="text-[10px] text-slate-400 block">{t('civilCourt')}</span>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('propertyTaxLabel')}</span>
                <span className={`font-semibold ${parcel.tax.taxStatus === 'Paid' ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {parcel.tax.taxStatus}
                </span>
                <span className="text-[10px] text-slate-400 block">AY {parcel.tax.assessmentYear}</span>
              </div>
            </div>

            {/* Explainable 9-Rule Anomaly Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-[#0B3D6E]">
                  {t('riskAnalysisTitle')} ({flags.length} {t('ruleFindingsCount')})
                </h3>
              </div>

              {flags.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">{t('riskStatusPristine')}</span>
                    <span className="text-[11px] text-emerald-700">{t('allRulesPassedZeroViolations')}</span>
                  </div>
                </div>
              ) : (
                flags.map((flag, idx) => {
                  const isExpanded = expandedFlagIndex === idx;
                  return (
                    <Card
                      key={flag.ruleId + idx}
                      variant={flag.severity === 'high' ? 'danger' : flag.severity === 'medium' ? 'warning' : 'default'}
                      className="p-3.5 space-y-2"
                    >
                      {/* Plain Language Finding Headline */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <Chip
                            size="sm"
                            severity={flag.severity === 'high' ? 'rose' : flag.severity === 'medium' ? 'amber' : 'info'}
                            label={flag.ruleId}
                          />
                          <div>
                            <h4 className="font-semibold text-slate-900 text-xs">
                              {tRule(flag.ruleId, 'title') || flag.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {flag.reason}
                            </p>
                          </div>
                        </div>

                        {/* Accordion Toggle */}
                        <button
                          onClick={() => setExpandedFlagIndex(isExpanded ? null : idx)}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          aria-label="Toggle rule details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Accordion: Trigger Fields & Competent Office */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-slate-200/80 space-y-2 text-[11px] bg-white/60 p-2.5 rounded-lg">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-semibold text-slate-500 uppercase text-[9px] block">{t('triggeredFields')}</span>
                              <span className="font-mono text-slate-800">{flag.triggeredFields.join(', ')}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-500 uppercase text-[9px] block">{t('responsibleOffice')}</span>
                              <span className="text-slate-800">{flag.responsibleOffice}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: OWNERSHIP (RoR) */}
        {activeTab === 'ror' && (
          <div className="space-y-4">
            <Card variant="default">
              <CardHeader>
                <CardTitle>{t('primaryTitleHolder')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t('ownerNameLabel')}</span>
                    <span className="font-bold text-slate-900 text-sm">{parcel.ownership.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('tabOwnership')}</span>
                    <span className="font-medium text-slate-900">{parcel.ownership.ownershipType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('registrationDateLabel')}</span>
                    <span className="font-medium text-slate-900">{parcel.ownership.registrationDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('sroOfficeLabel')}</span>
                    <span className="font-medium text-slate-900">{parcel.ownership.subRegistrarOffice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Differential Co-Owners Privacy Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>{t('jointCoOwners')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isOfficerOrAdmin ? (
                  parcel.ownership.coOwners && parcel.ownership.coOwners.length > 0 ? (
                    <div className="space-y-2">
                      {parcel.ownership.coOwners.map((name, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-900">{name}</span>
                            <span className="text-slate-500 block text-[11px]">{t('verifiedCoOwner')}</span>
                          </div>
                          <span className="font-mono font-bold text-[#0B3D6E]">{t('jointShare')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">{t('soleProprietorshipRecord')}</p>
                  )
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2.5 text-xs text-[#0B3D6E]">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>{t('coOwnerPrivacyNotice')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: ENCUMBRANCE */}
        {activeTab === 'encumbrance' && (
          <div className="space-y-4">
            {/* Civil Court Litigation */}
            <Card variant={isDisputed ? 'danger' : 'default'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#0B3D6E]" />
                  <span>{t('disputeTitle')}</span>
                </CardTitle>
                <Chip
                  size="sm"
                  severity={isDisputed ? 'court' : 'clear'}
                  label={isDisputed ? t('activeInjunction') : t('clean')}
                />
              </CardHeader>
              <CardContent>
                {isDisputed ? (
                  isOfficerOrAdmin ? (
                    <div className="space-y-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 font-mono">
                      <p><strong>Court Case:</strong> {parcel.encumbrance.courtCaseNumber || 'OS-4192/2024'}</p>
                      <p><strong>Stay Order:</strong> {parcel.encumbrance.stayOrderDetails || 'Interim injunction restraining alienations'}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
                      <p className="font-semibold">{t('disputeActive')}</p>
                      <p className="text-[11px] text-rose-700 mt-1">{t('courtDocketProtected')}</p>
                    </div>
                  )
                ) : (
                  <p className="text-emerald-700 font-semibold">{t('disputeNone')}</p>
                )}
              </CardContent>
            </Card>

            {/* Bank Mortgage & Financial Liens */}
            <Card variant={parcel.encumbrance.hasMortgage ? 'warning' : 'default'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0B3D6E]" />
                  <span>{t('mortgageSection')}</span>
                </CardTitle>
                <Chip
                  size="sm"
                  severity={parcel.encumbrance.hasMortgage ? 'amber' : 'clear'}
                  label={parcel.encumbrance.hasMortgage ? t('activeLien') : t('clearTitle')}
                />
              </CardHeader>
              <CardContent>
                {parcel.encumbrance.hasMortgage ? (
                  isOfficerOrAdmin ? (
                    <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-xs">
                      <p><strong>Mortgage Charge ID:</strong> {parcel.encumbrance.mortgageDetails?.chargeId || 'CHG-99410'}</p>
                      <p><strong>Lending Institution:</strong> {parcel.encumbrance.mortgageDetails?.lenderName || 'State Bank of India'}</p>
                      <p><strong>Sanction Amount:</strong> ₹{parcel.encumbrance.mortgageDetails?.loanAmountInr?.toLocaleString('en-IN') || '45,00,000'}</p>
                      <p><strong>Sanction Date:</strong> {parcel.encumbrance.mortgageDetails?.sanctionDate || '2023-11-14'}</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                      <p className="font-semibold">{t('mortgageActive')}</p>
                      <p className="text-[11px] text-amber-700 mt-1">{t('bankingDetailsProtected')}</p>
                    </div>
                  )
                ) : (
                  <p className="text-emerald-700 font-semibold">{t('mortgageNone')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: ZONING & TAX */}
        {activeTab === 'zoning' && (
          <div className="space-y-4">
            <Card variant="default">
              <CardHeader>
                <CardTitle>{t('masterPlanZoningTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t('zoningCategoryLabel')}</span>
                    <span className="font-semibold text-slate-900">{parcel.zoning?.masterPlanClassification || 'Residential'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('landUseLabel')}</span>
                    <span className="font-semibold text-slate-900">{parcel.zoning?.registeredLandUse || 'Residential'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('centroidCoordinates')}</span>
                    <span className="font-mono text-slate-800">{parcel.centroidLat?.toFixed(5)}° N, {parcel.centroidLon?.toFixed(5)}° E</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('stateCode')}</span>
                    <span className="font-mono font-bold text-[#0B3D6E]">{parcel.stateCode}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#0B3D6E]" />
                  <span>{t('propertyTaxLabel')}</span>
                </CardTitle>
                <Chip
                  size="sm"
                  severity={parcel.tax.taxStatus === 'Paid' ? 'clear' : 'rose'}
                  label={parcel.tax.taxStatus === 'Paid' ? t('taxStatusPaid') : t('taxStatusArrears')}
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{t('assessmentPid')}</span>
                    <span className="font-mono text-slate-900">{parcel.tax.propertyTaxAssessmentNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('taxAssessmentYear')}</span>
                    <span className="font-semibold text-slate-900">{parcel.tax.assessmentYear}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('annualTaxDemand')}</span>
                    <span className="font-bold text-slate-900">₹{parcel.tax.annualTaxDemandInr.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('lastPaymentReceipt')}</span>
                    <span className="text-slate-700">{parcel.tax.lastPaymentDate || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: ACTIVITY (LEDGER) */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-[#0B3D6E] flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>{t('auditTrailForParcel')}</span>
              </h3>
            </div>

            {isLoadingLedger ? (
              <div className="p-8 text-center text-slate-500">
                <div className="w-5 h-5 rounded-full border-2 border-[#0B3D6E] border-t-transparent animate-spin mx-auto mb-2" />
                <span>{t('queryingLedger')}</span>
              </div>
            ) : parcelLedgerBlocks.length === 0 ? (
              <p className="text-slate-500 p-4 bg-slate-50 rounded-lg text-center">
                {t('noLedgerActivity')}
              </p>
            ) : (
              <div className="space-y-2.5">
                {parcelLedgerBlocks.map((block) => (
                  <div
                    key={block.blockIndex}
                    className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#0B3D6E]">
                        Block #{block.blockIndex} · {block.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(block.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-slate-700 font-sans">
                      {block.details}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                      <span>{t('actor')} <strong className="text-slate-700">{block.actorName} ({block.actorRole})</strong></span>
                      <CopyHashPill hash={block.currentHash} truncateLength={6} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
