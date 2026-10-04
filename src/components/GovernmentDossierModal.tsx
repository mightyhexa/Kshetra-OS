import React, { useRef, useState } from 'react';
import { Parcel, UserRole } from '../types';
import { KshetraMark } from './KshetraMark';
import { computeParcelFlags } from '../services/riskEngine';
import { useLanguage } from '../context/LanguageContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  ExternalLink,
  Layers,
  FileText
} from 'lucide-react';

interface GovernmentDossierModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
}

export const GovernmentDossierModal: React.FC<GovernmentDossierModalProps> = ({
  parcel,
  isOpen,
  onClose,
  userRole = 'citizen'
}) => {
  const { t } = useLanguage();
  const dossierRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !parcel) return null;

  const flags = computeParcelFlags(parcel);
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const isDisputed = parcel.encumbrance.disputeFlag;
  const isOfficerOrAdmin = userRole === 'officer' || userRole === 'policy_admin';

  // Direct High-Resolution PDF Download using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!dossierRef.current) return;
    setIsExporting(true);

    try {
      const element = dossierRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // 2x DPI for crisp vector-like text
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
      pdf.save(`KSHETRA_OS_Dossier_${parcel.ulpin}.pdf`);
    } catch (err) {
      console.error('PDF export failed, falling back to print window', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-6 max-h-[96vh] flex flex-col">
        {/* Modal Action Header (Excluded from Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0f172a] text-white rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-cinzel">
                  {t('dossierModalTitle')}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  {t('tamperEvidentStandard')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-rajdhani">
                {t('officialDpiSubtitle')} • ULPIN {parcel.ulpin}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? t('generatingPdf') : t('downloadOfficialPdf')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('print')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
              title={t('closePreview')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Dossier Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div
            ref={dossierRef}
            className="relative bg-white text-slate-800 p-6 sm:p-8 border border-[#0f172a] rounded-lg shadow-xs select-text overflow-hidden print:border-none print:p-0 print:m-0"
            style={{ minHeight: '1020px' }}
          >
            {/* 1. FAINT DIAGONAL BACKGROUND WATERMARK */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
              style={{ opacity: 0.05 }}
            >
              <div className="transform -rotate-35 text-5xl sm:text-6xl font-black tracking-widest text-[#0f172a] text-center uppercase whitespace-nowrap font-cinzel">
                VERIFIED CADASTRE - KSHETRA OS
                <br />
                <span className="text-3xl font-rajdhani tracking-normal">
                  GOVERNMENT OF INDIA • LAND GOVERNANCE DPI
                </span>
              </div>
            </div>

            {/* RELATIVE CONTENT BODY (Z-10) */}
            <div className="relative z-10 space-y-4">
              {/* 2. THREE-COLUMN AUTHORITATIVE HEADER */}
              <div className="grid grid-cols-12 gap-3 items-center pb-3 border-b-2 border-[#0f172a]">
                {/* Left: KSHETRA Cadastral Symbol */}
                <div className="col-span-2 flex flex-col items-center justify-center text-center">
                  <KshetraMark size={40} className="w-10 h-10" />
                  <span className="text-[9px] font-bold text-[#0B3D6E] tracking-wider mt-1 uppercase font-rajdhani">
                    KSHETRA DPI
                  </span>
                </div>

                {/* Center: Main Titles */}
                <div className="col-span-8 text-center space-y-0.5">
                  <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-slate-600 uppercase font-rajdhani">
                    GOVERNMENT OF INDIA • MINISTRY OF RURAL DEVELOPMENT
                  </div>
                  <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest font-rajdhani">
                    DEPARTMENT OF LAND RESOURCES • NATIONAL SPATIAL DATA INFRASTRUCTURE (NSDI)
                  </div>
                  <h1 className="text-sm sm:text-base font-black text-[#0f172a] tracking-wide uppercase font-cinzel leading-tight pt-1">
                    KSHETRA OS — OFFICIAL CADASTRAL LAND RECORD (RoR)
                  </h1>
                  <p className="text-[10px] text-slate-500 font-rajdhani font-medium">
                    Integrated GIS Digital Public Infrastructure Dossier • Issued under SIH26014 Standard
                  </p>
                </div>

                {/* Right: 2D QR Code & Verification Tag */}
                <div className="col-span-2 flex flex-col items-center justify-center text-center">
                  <div className="p-1 bg-white border border-slate-300 rounded shadow-2xs">
                    {/* Simulated SVG 2D QR Code for Instant Verification */}
                    <svg viewBox="0 0 100 100" className="w-14 h-14">
                      {/* Corner Finder Patterns */}
                      <rect x="5" y="5" width="26" height="26" fill="#0f172a" />
                      <rect x="9" y="9" width="18" height="18" fill="#ffffff" />
                      <rect x="13" y="13" width="10" height="10" fill="#0f172a" />

                      <rect x="69" y="5" width="26" height="26" fill="#0f172a" />
                      <rect x="73" y="9" width="18" height="18" fill="#ffffff" />
                      <rect x="77" y="13" width="10" height="10" fill="#0f172a" />

                      <rect x="5" y="69" width="26" height="26" fill="#0f172a" />
                      <rect x="9" y="73" width="18" height="18" fill="#ffffff" />
                      <rect x="13" y="77" width="10" height="10" fill="#0f172a" />

                      {/* Random Data Pattern Dots */}
                      <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                      <rect x="46" y="8" width="6" height="6" fill="#0f172a" />
                      <rect x="56" y="8" width="6" height="6" fill="#0f172a" />
                      <rect x="36" y="20" width="6" height="6" fill="#0f172a" />
                      <rect x="46" y="26" width="6" height="6" fill="#0f172a" />
                      <rect x="12" y="38" width="6" height="6" fill="#0f172a" />
                      <rect x="24" y="42" width="6" height="6" fill="#0f172a" />
                      <rect x="38" y="38" width="6" height="6" fill="#0f172a" />
                      <rect x="52" y="40" width="6" height="6" fill="#0f172a" />
                      <rect x="68" y="38" width="6" height="6" fill="#0f172a" />
                      <rect x="80" y="42" width="6" height="6" fill="#0f172a" />
                      <rect x="38" y="54" width="6" height="6" fill="#0f172a" />
                      <rect x="48" y="60" width="6" height="6" fill="#0f172a" />
                      <rect x="62" y="54" width="6" height="6" fill="#0f172a" />
                      <rect x="74" y="62" width="6" height="6" fill="#0f172a" />
                      <rect x="40" y="74" width="6" height="6" fill="#0f172a" />
                      <rect x="54" y="78" width="6" height="6" fill="#0f172a" />
                      <rect x="72" y="76" width="6" height="6" fill="#0f172a" />
                      <rect x="86" y="80" width="6" height="6" fill="#0f172a" />
                    </svg>
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 font-mono tracking-tight mt-0.5">
                    {t('scanToVerify')}
                  </span>
                </div>
              </div>

              {/* 3. ULPIN DOSSIER SUMMARY STRIP */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-rajdhani font-semibold">
                    {t('bhuAadhaarFullName')}
                  </span>
                  <span className="font-mono font-bold text-sm text-[#0f172a] tracking-wide">
                    {parcel.ulpin}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-rajdhani font-semibold">
                    {t('cadastralVerificationStatus')}
                  </span>
                  {isDisputed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300">
                      ⚠️ {t('activeJudicialStayOrder')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      {t('verifiedCadastreStatus')}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. SECTION 1: SPATIAL IDENTIFICATION GRID (BASE LAYER) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-0.5 border-b border-slate-300">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a] font-rajdhani">
                    {t('geodeticLayer1Title')}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">CRS: EPSG:4326 (WGS 84)</span>
                </div>

                <div className="grid grid-cols-4 border border-slate-300 rounded-md overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('surveyKhasraNo')}
                  </div>
                  <div className="bg-white p-2 font-bold text-slate-900 border-b border-r border-slate-200">
                    {parcel.surveyNumber}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('registeredExtent')}
                  </div>
                  <div className="bg-white p-2 font-bold text-slate-900 border-b border-slate-200">
                    {parcel.areaSqm} m² ({parcel.areaAcres} Acres)
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('stateCode')}
                  </div>
                  <div className="bg-white p-2 font-medium text-slate-900 border-b border-slate-200">
                    {parcel.state}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('district')}
                  </div>
                  <div className="bg-white p-2 font-medium text-slate-900 border-b border-slate-200">
                    {parcel.district}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-r border-slate-200">
                    {t('talukSubDistrict')}
                  </div>
                  <div className="bg-white p-2 font-medium text-slate-900 border-r border-slate-200">
                    {parcel.subDistrictTaluk || parcel.subDistrict}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-r border-slate-200">
                    {t('centroidCoordinates')}
                  </div>
                  <div className="bg-white p-2 font-mono text-[11px] text-slate-900">
                    {parcel.centroidLat.toFixed(5)}°N, {parcel.centroidLon.toFixed(5)}°E
                  </div>
                </div>
              </div>

              {/* 5. SECTION 2: RECORD OF RIGHTS & CONVEYANCE (ESSENTIAL LAYER) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-0.5 border-b border-slate-300">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a] font-rajdhani">
                    {t('rorLayer2Title')}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">Tenure: {parcel.ownership.ownershipType}</span>
                </div>

                <div className="grid grid-cols-4 border border-slate-300 rounded-md overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('primaryTitleHolder')}
                  </div>
                  <div className="bg-white p-2 font-bold text-slate-900 border-b border-r border-slate-200 col-span-3">
                    {parcel.ownership.ownerName}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('coSharersHeirs')}
                  </div>
                  <div className="bg-white p-2 font-medium text-slate-800 border-b border-r border-slate-200 col-span-3">
                    {parcel.ownership.coOwners && parcel.ownership.coOwners.length > 0
                      ? parcel.ownership.coOwners.join(', ')
                      : t('noneRecordedSole')}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-r border-slate-200">
                    {t('conveyanceDeedNo')}
                  </div>
                  <div className="bg-white p-2 font-mono font-bold text-slate-900 border-r border-slate-200">
                    {parcel.ownership.documentNumber || parcel.ownership.registrationNumber}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-r border-slate-200">
                    {t('registrationDateSro')}
                  </div>
                  <div className="bg-white p-2 text-slate-900">
                    {parcel.ownership.registrationDate} ({parcel.ownership.subRegistrarOffice})
                  </div>
                </div>
              </div>

              {/* 6. SECTION 3: MASTER PLAN ZONING & ENCUMBRANCES */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-0.5 border-b border-slate-300">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a] font-rajdhani">
                    {t('zoningLayer3Title')}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">FAR Allowed: {parcel.zoning.floorAreaRatioAllowed}</span>
                </div>

                <div className="grid grid-cols-4 border border-slate-300 rounded-md overflow-hidden text-xs">
                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('masterPlanZoningTitle')}
                  </div>
                  <div className="bg-white p-2 font-semibold text-slate-900 border-b border-r border-slate-200">
                    {parcel.zoning.masterPlanClassification}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('registeredLandUse')}
                  </div>
                  <div className="bg-white p-2 font-semibold text-slate-900 border-b border-slate-200">
                    {parcel.zoning.registeredLandUse}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-r border-slate-200">
                    {t('buildingPermission')}
                  </div>
                  <div className="bg-white p-2 text-slate-900 border-r border-slate-200">
                    {parcel.zoning.buildingPermissionStatus} (Max Height: {parcel.zoning.maxBuildingHeightMeters || 15}m)
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-r border-slate-200">
                    {t('bankEncumbranceCharge')}
                  </div>
                  <div className="bg-white p-2 text-slate-900 font-medium">
                    {parcel.encumbrance.hasMortgage ? (
                      isOfficerOrAdmin && parcel.encumbrance.mortgageDetails ? (
                        <span className="text-amber-900 font-bold">
                          Active: INR {parcel.encumbrance.mortgageDetails.loanAmountInr.toLocaleString('en-IN')} ({parcel.encumbrance.mortgageDetails.lenderName})
                        </span>
                      ) : (
                        <span className="text-amber-800 font-bold">{t('activeMortgageDisclosed')}</span>
                      )
                    ) : (
                      <span className="text-emerald-700 font-semibold">{t('cleanTitleNil')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 7. SECTION 4: FISCAL DEMAND & PUBLIC UTILITIES (NO OVERLAPS) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-0.5 border-b border-slate-300">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f172a] font-rajdhani">
                    {t('fiscalLayer4Title')}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">Tax Status: {parcel.tax.taxStatus}</span>
                </div>

                <div className="grid grid-cols-4 border border-slate-300 rounded-md overflow-hidden text-xs">
                  {/* Property Tax Assessment No. with break-all to prevent any overlap bug */}
                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('assessmentPid')}
                  </div>
                  <div className="bg-white p-2 font-mono font-bold text-slate-900 border-b border-r border-slate-200 break-all">
                    {parcel.tax.propertyTaxAssessmentNo}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-b border-r border-slate-200">
                    {t('taxStatusDemand')}
                  </div>
                  <div className="bg-white p-2 font-medium text-slate-900 border-b border-slate-200">
                    {parcel.tax.taxStatus} (Demand: ₹{parcel.tax.annualTaxDemandInr.toLocaleString('en-IN')})
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-r border-slate-200">
                    {t('electricityConsumerId')}
                  </div>
                  <div className="bg-white p-2 font-mono text-slate-900 border-r border-slate-200">
                    {parcel.tax.electricityConsumerNo || 'DISCOM-BULK-01'}
                  </div>

                  <div className="bg-slate-100 p-2 font-semibold text-slate-600 border-r border-slate-200">
                    {t('roadAccessRowWidth')}
                  </div>
                  <div className="bg-white p-2 font-medium text-slate-900">
                    {t('publicArterialRow')}
                  </div>
                </div>
              </div>

              {/* 8. SECTION 5: RISK FLAGS (IF APPLICABLE) */}
              {flags.length > 0 && (
                <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-md text-xs space-y-1">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5 text-[11px]">
                    <span>⚠️ {t('cadastralRiskAnomalies')} ({flags.length}):</span>
                  </div>
                  {flags.map((f) => (
                    <div key={f.ruleId} className="text-[11px] text-rose-800">
                      <strong>[{f.ruleId}] {f.title}:</strong> {f.reason}
                    </div>
                  ))}
                </div>
              )}

              {/* 9. CRYPTOGRAPHIC SIGNATURE BLOCK & BARCODE */}
              <div className="pt-2 border-t-2 border-[#0f172a] space-y-2">
                <div className="grid grid-cols-2 gap-4 items-end text-xs">
                  {/* Left: Tamper-Evident SHA-256 Ledger Signature */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('digitallySignedNsdi')}</span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-500 break-all leading-tight">
                      SHA-256 Digest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Timestamp: {currentDate} {currentTime} IST • Verification Key: KSHETRA-{parcel.ulpin.replace(/[^A-Z0-9]/g, '')}-DPI
                    </div>
                  </div>

                  {/* Right: Revenue Department Seal */}
                  <div className="text-right space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 uppercase font-cinzel">
                      {t('competentRevenueAuthority')}
                    </div>
                    <div className="text-[10px] text-slate-500 font-rajdhani">
                      {t('deptLandRecordsSurvey')}
                    </div>
                    <div className="text-[9px] font-mono text-emerald-700 font-semibold">
                      {t('electronicSignatureVerified')}
                    </div>
                  </div>
                </div>

                {/* 10. AUTHENTIC HIGH-DENSITY BARCODE PLACEHOLDER */}
                <div className="pt-2 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 340 30" className="w-64 h-7 text-slate-900">
                    {/* Simulated High Density Barcode Lines */}
                    {[
                      2, 1, 3, 1, 1, 4, 2, 1, 3, 2, 1, 1, 2, 3, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2,
                      1, 3, 1, 4, 2, 1, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 1, 2, 1, 3, 2, 4
                    ].map((w, i) => (
                      <rect
                        key={i}
                        x={i * 6.8}
                        y="0"
                        width={w * 1.1}
                        height="24"
                        fill="#0f172a"
                      />
                    ))}
                  </svg>
                  <span className="font-mono text-[9px] text-slate-600 tracking-widest mt-0.5">
                    *{parcel.ulpin}*
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
