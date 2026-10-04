import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../services/apiClient';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { CopyHashPill } from './ui/CopyHashPill';
import { 
  FileCheck2, 
  UploadCloud, 
  CheckCircle2, 
  AlertOctagon, 
  FileText, 
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const DocumentVerificationView: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    matched: boolean;
    status: 'MATCH' | 'NO_MATCH';
    calculatedHash?: string;
    computedHash?: string;
    block?: {
      blockIndex: number;
      action: string;
      timestamp: string;
      actorName: string;
      actorRole: string;
      details: string;
      currentHash: string;
    };
    error?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVerificationResult(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setIsVerifying(true);
    try {
      const res = await apiClient.verifyDossierPdf(file);
      setVerificationResult({
        matched: res.matched,
        status: res.status,
        calculatedHash: res.calculatedHash,
        computedHash: res.calculatedHash,
        block: res.block
      });
    } catch (err: any) {
      setVerificationResult({
        matched: false,
        status: 'NO_MATCH',
        calculatedHash: 'Unknown',
        computedHash: 'Unknown',
        error: err.message || 'Cryptographic verification failed'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-[#0B3D6E]" />
          <h1 className="font-serif text-2xl font-bold text-[#0B3D6E] tracking-tight">
            {t('verifyDocumentTitle')}
          </h1>
        </div>
        <p className="text-sm text-[#64748B] mt-1">
          {t('verifyDocumentSubtitle')}
        </p>
      </div>

      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#0B3D6E]" />
            <span>{t('uploadDossierTitle')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#CBD5E1] hover:border-[#0B3D6E] rounded-xl bg-[#F8FAFC] hover:bg-blue-50/40 transition-colors cursor-pointer text-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
              <FileText className="w-10 h-10 text-slate-400 mb-2" />
              <span className="text-sm font-semibold text-[#0F172A]">
                {file ? file.name : t('verifyUploadDropzone')}
              </span>
              <span className="text-xs text-[#64748B] mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : t('uploadDossierHint')}
              </span>
            </label>

            <div className="flex justify-end gap-3">
              {file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setVerificationResult(null);
                  }}
                >
                  {t('actionCancel')}
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                disabled={!file}
                isLoading={isVerifying}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                onClick={handleVerify}
              >
                {t('actionVerifyIntegrity')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Results Panel */}
      {verificationResult && (
        <Card
          variant={verificationResult.matched ? 'default' : 'danger'}
          className="animate-in fade-in duration-200"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {verificationResult.matched ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertOctagon className="w-6 h-6 text-rose-600" />
                )}
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0F172A]">
                    {verificationResult.matched
                      ? t('verifyMatchSuccess')
                      : t('verifyMatchFailed')}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {verificationResult.matched
                      ? t('verifyMatchSuccessDesc')
                      : t('verifyMatchFailedDesc')}
                  </p>
                </div>
              </div>
              <Chip
                severity={verificationResult.matched ? 'clear' : 'rose'}
                label={verificationResult.status}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-slate-200">
                <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  {t('computedDigest')}
                </span>
                <CopyHashPill hash={verificationResult.computedHash || 'N/A'} truncateLength={14} />
              </div>

              {verificationResult.block && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                    {t('ledgerAnchoredBlock')}
                  </span>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-700" />
                    <span className="font-mono font-bold text-emerald-950">
                      Block #{verificationResult.block.blockIndex} · {verificationResult.block.action}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {verificationResult.block && (
              <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2 text-xs">
                <h4 className="font-semibold text-slate-800">{t('ledgerDetails')}</h4>
                <p className="text-slate-600 leading-relaxed font-mono">
                  {verificationResult.block.details}
                </p>
                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 text-slate-500">
                  <span>{t('ledgerActor')}: <strong className="text-slate-700">{verificationResult.block.actorName} ({verificationResult.block.actorRole})</strong></span>
                  <span>{t('ledgerTimestamp')}: <strong className="text-slate-700">{new Date(verificationResult.block.timestamp).toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
