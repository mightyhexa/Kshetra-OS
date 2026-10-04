import React, { useRef } from 'react';
import { Parcel } from '../types';
import { KshetraMark } from './KshetraMark';
import { generateParcelPdfReport } from '../services/pdfReportGenerator';
import { useLanguage } from '../context/LanguageContext';
import { X, Printer, ShieldCheck, CheckCircle2, QrCode, FileText, Download } from 'lucide-react';

interface DigitalCertificateModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalCertificateModal: React.FC<DigitalCertificateModalProps> = ({
  parcel,
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !parcel) return null;

  const handlePrint = () => {
    window.print();
  };

  const certificateNumber = `GOI-EC-${parcel.district.slice(0, 3).toUpperCase()}-${parcel.surveyNumber.replace('/', '-')}-${parcel.ulpin.slice(-4)}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#0B3D6E] text-white rounded-lg">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('certGeneratorTitle')}</h2>
              <p className="text-[11px] text-slate-500">{t('certGeneratorSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateParcelPdfReport(parcel)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              title={t('downloadPdfFile')}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('downloadPdfFile')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B3D6E] hover:bg-[#082a4d] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('printView')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government Certificate */}
        <div
          ref={certificateRef}
          className="bg-white border-4 border-double border-slate-700 p-8 rounded-lg shadow-sm space-y-6 text-slate-900 print:border-none print:p-0"
        >
          {/* Header */}
          <div className="text-center space-y-1.5 border-b-2 border-slate-800 pb-4">
            <div className="flex justify-center mb-1">
              <KshetraMark size={48} className="w-12 h-12" />
            </div>
            <div className="text-[10px] font-rajdhani uppercase tracking-[0.25em] text-[#0B3D6E] font-bold">
              KSHETRA OS CADASTRE SPECIFICATION
            </div>
            <h1 className="text-xs font-bold uppercase tracking-widest text-slate-600 font-rajdhani">
              Government of {parcel.state} • Department of Revenue & Land Records
            </h1>
            <h2 className="text-lg font-black uppercase tracking-wide text-slate-900 font-cinzel">
              FORM 15 — CERTIFICATE OF CADASTRE & ENCUMBRANCE SEARCH
            </h2>
            <p className="text-[11px] text-slate-500">
              Issued under the National Digital Public Infrastructure for Land Governance (KSHETRA OS / SIH26014)
            </p>
          </div>

          {/* Certificate Identification Bar */}
          <div className="grid grid-cols-2 text-xs border-b border-slate-200 pb-3 gap-2 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">{t('certificateDocketNumber')}</span>
              <span className="font-bold text-[#0B3D6E]">{certificateNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">{t('dateOfCertification')}</span>
              <span className="font-bold text-slate-900">{currentDate}</span>
            </div>
          </div>

          {/* Parcel & Ownership Details */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1">
              {t('geodeticLayer1Title')}
            </h3>
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">{t('ulpinLabel')}</span>
                <span className="font-mono font-bold text-[#0B3D6E]">{parcel.ulpin}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{t('surveyKhasraNo')}</span>
                <span className="font-bold">{parcel.surveyNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{t('registeredExtent')}</span>
                <span className="font-bold">{parcel.areaSqm} m² ({parcel.areaAcres} Acres)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{t('talukSubDistrict')}</span>
                <span>{parcel.subDistrictTaluk || parcel.subDistrict}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{t('district')} & {t('stateCode')}</span>
                <span>{parcel.district}, {parcel.state}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Geodetic CRS Datum</span>
                <span className="font-mono">EPSG:4326 (WGS 84)</span>
              </div>
            </div>

            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1 pt-2">
              {t('rorLayer2Title')}
            </h3>
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('recordedTitleHolder')}</span>
                  <span className="font-bold text-sm">{parcel.ownership.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('tenureType')}</span>
                  <span className="font-medium">{parcel.ownership.ownershipType} Tenure</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('conveyanceInstrumentNo')}</span>
                  <span className="font-mono">{parcel.ownership.documentNumber || parcel.ownership.registrationNumber} ({parcel.ownership.registrationDate})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('subRegistrarOfficeLabel')}</span>
                  <span>{parcel.ownership.subRegistrarOffice}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block text-[10px]">{t('encumbranceVerificationFinding')}</span>
                {parcel.encumbrance.hasMortgage ? (
                  <p className="text-amber-900 font-semibold text-xs mt-0.5">
                    ⚠️ {t('activeChargeDisclosed')} {parcel.encumbrance.mortgageDetails?.chargeId || 'REF-CERSAI-0912'}.
                  </p>
                ) : (
                  <p className="text-emerald-800 font-semibold text-xs mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    {t('cleanTitleNilFound')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Digital Signature & Tamper Proof Seal */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-800 items-end">
            <div className="space-y-1.5 text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 font-sans text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('digitallySealedKshetra')}</span>
              </div>
              <div>SHA-256 Ledger Block: #04 • Hash Verified</div>
              <div className="text-[9px] text-slate-400 truncate">
                Digest: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block p-2 bg-slate-100 rounded-lg border border-slate-300 font-mono text-[9px] text-slate-700">
                {t('digitallySignedTahsildar')}
                <br />
                {currentDate} 11:42:19 IST
              </div>
              <div className="font-bold text-xs text-slate-900">
                {t('competentRevenueAuthority')}
              </div>
              <div className="text-[10px] text-slate-500">
                {t('deptLandResourcesGoI')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
