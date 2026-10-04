import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { AuditLedgerEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from './ui/Toast';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { CopyHashPill } from './ui/CopyHashPill';
import { PlotTag } from './ui/PlotTag';
import { Skeleton } from './ui/Skeleton';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Download, 
  RefreshCw, 
  Bug, 
  RotateCcw,
  Database,
  ChevronDown,
  ChevronUp,
  Radio,
  Lock
} from 'lucide-react';

export const AuditLedgerView: React.FC = () => {
  const { currentRole, sessionToken } = useAuth();
  const { t } = useLanguage();
  const { success, error: toastError, warning } = useToast();

  const [entries, setEntries] = useState<AuditLedgerEntry[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedBlockForStrip, setSelectedBlockForStrip] = useState<number | null>(null);

  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    verifiedBlocks: number;
    brokenBlockIndex?: number;
    reason?: string;
    timestamp: string;
  } | null>(null);

  const isAdmin = currentRole === 'policy_admin';

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getLedger();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  // Listen to live SSE event broadcasts
  useEffect(() => {
    const t = sessionToken || apiClient.getToken();
    if (!t) return;
    const eventSource = new EventSource(`/api/events?token=${encodeURIComponent(t)}`);

    const handleLedgerEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'LEDGER_BLOCK') {
          loadEntries();
        }
      } catch {
        // Safe parse
      }
    };

    eventSource.onmessage = handleLedgerEvent;
    eventSource.addEventListener('LEDGER_BLOCK', handleLedgerEvent as EventListener);

    return () => {
      eventSource.close();
    };
  }, [sessionToken]);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    setVerificationProgress(0);

    // Progressive animation
    const interval = setInterval(() => {
      setVerificationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 30;
      });
    }, 120);

    try {
      const result = await apiClient.verifyLedger();
      clearInterval(interval);
      setVerificationProgress(100);

      setVerificationResult({
        isValid: result.isValid,
        verifiedBlocks: result.verifiedBlocks ?? (result as any).checked ?? entries.length,
        brokenBlockIndex: result.brokenBlockIndex ?? (result as any).firstBrokenIndex,
        reason: result.errorReason ?? (result as any).reason,
        timestamp: new Date().toLocaleTimeString('en-IN')
      });

      if (result.isValid) {
        success(t('verificationSucceeded'), `All ${result.verifiedBlocks || entries.length} ledger blocks cryptographically verified.`);
      } else {
        toastError(t('tamperDetected'), `Hash mismatch at Block #${result.brokenBlockIndex}`);
      }
    } catch (err: any) {
      toastError(t('verificationError'), err.message || 'Integrity check failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulateTamper = async () => {
    try {
      const res = await apiClient.tamperLedger();
      warning(t('tamperSimulated'), res.message);
      await loadEntries();
      await handleVerifyIntegrity();
    } catch (err: any) {
      toastError(t('simulationError'), err.message || 'Tamper simulation failed');
    }
  };

  const handleResetLedger = async () => {
    try {
      const res = await apiClient.resetLedger();
      success(t('ledgerRestored'), res.message);
      setVerificationResult(null);
      await loadEntries();
      await handleVerifyIntegrity();
    } catch (err: any) {
      toastError(t('resetError'), err.message || 'Failed to reset ledger');
    }
  };

  const handleExportJson = async () => {
    try {
      const blob = await apiClient.exportLedgerJson();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kshetra_audit_ledger_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      success(t('exportComplete'), 'Audit ledger downloaded as JSON.');
    } catch {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `kshetra_audit_ledger_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      success(t('exportComplete'), 'Audit ledger downloaded as JSON.');
    }
  };

  const filteredEntries = entries.filter((e) => {
    const q = searchFilter.toLowerCase();
    return (
      !q ||
      e.action.toLowerCase().includes(q) ||
      e.actorName.toLowerCase().includes(q) ||
      e.actorRole.toLowerCase().includes(q) ||
      (e.parcelUlpin && e.parcelUlpin.toLowerCase().includes(q)) ||
      e.details.toLowerCase().includes(q) ||
      e.currentHash.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Ledger Architecture Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B3D6E]">
              {t('ledgerTitle')}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#0B3D6E] font-semibold border border-blue-200 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>{t('liveSync')}</span>
            </span>
          </div>
          <h1 className="font-serif text-xl font-bold text-slate-900 mt-1">
            {t('ledgerTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('ledgerSubtitle')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Button
            variant="primary"
            size="sm"
            isLoading={isVerifying}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            onClick={handleVerifyIntegrity}
          >
            {t('actionVerifyIntegrity')}
          </Button>

          {isAdmin ? (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Bug className="w-3.5 h-3.5 text-amber-700" />}
                onClick={handleSimulateTamper}
                className="border-amber-300 text-amber-900 hover:bg-amber-50"
              >
                {t('actionTamperDemo')}
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-600" />}
                onClick={handleResetLedger}
              >
                {t('actionResetLedger')}
              </Button>
            </>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Lock className="w-3 h-3" /> {t('adminTamperToolsLocked')}
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportJson}
          >
            {t('actionExportJson')}
          </Button>
        </div>
      </div>

      {/* Verification Result Banner (Green on Pass, Red on Fail) */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-4 text-xs transition-all animate-in fade-in duration-200 ${
            verificationResult.isValid
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-bold text-sm">
                {verificationResult.isValid
                  ? t('ledgerChainValid')
                  : t('ledgerChainCorrupted')}
              </h3>
              <p className="mt-0.5 leading-relaxed text-[11px]">
                {verificationResult.isValid
                  ? `Cryptographic SHA-256 link verified across all ${verificationResult.verifiedBlocks} historical blocks. Zero breaks detected.`
                  : `Integrity check failed: ${verificationResult.reason || `Corrupted payload at Block #${verificationResult.brokenBlockIndex}`}`}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">
            {verificationResult.timestamp}
          </span>
        </div>
      )}

      {/* Visual Interactive Chain Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            {t('ledgerTitle')} ({entries.length})
          </span>
          <span className="text-[10px] text-slate-400">{t('clickBlockToInspect')}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          {entries.map((block) => (
            <button
              key={block.blockIndex}
              onClick={() => setSelectedBlockForStrip(selectedBlockForStrip === block.blockIndex ? null : block.blockIndex)}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-center font-mono text-[11px] transition-all cursor-pointer ${
                selectedBlockForStrip === block.blockIndex
                  ? 'bg-[#0B3D6E] text-white border-[#0B3D6E] shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className="font-bold block text-[10px]">#{block.blockIndex}</span>
              <span className="text-[9px] opacity-75">{block.action.slice(0, 10)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative grow bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center overflow-hidden">
          <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={t('searchLedgerPlaceholder')}
            className="w-full px-3 py-2 text-xs focus:outline-none placeholder:text-slate-400 font-sans"
          />
        </div>
        <span className="text-xs text-slate-500 shrink-0 font-medium">
          Showing {filteredEntries.length} of {entries.length} Blocks
        </span>
      </div>

      {/* Ledger Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rectangular" className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <th className="p-3 w-16">{t('ledgerBlockIndex')}</th>
                  <th className="p-3">{t('tableHeaderAction')}</th>
                  <th className="p-3">{t('ledgerActor')}</th>
                  <th className="p-3">{t('ulpinLabel')}</th>
                  <th className="p-3">{t('ledgerDetails')}</th>
                  <th className="p-3">{t('ledgerHash')}</th>
                  <th className="p-3 text-right">{t('ledgerDetails')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEntries.map((entry) => {
                  const isExpanded = expandedIndex === entry.blockIndex || selectedBlockForStrip === entry.blockIndex;

                  return (
                    <React.Fragment key={entry.blockIndex}>
                      <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-blue-50/40' : ''}`}>
                        <td className="p-3 font-mono font-bold text-[#0B3D6E]">
                          #{entry.blockIndex}
                        </td>
                        <td className="p-3 font-semibold">
                          <Chip size="sm" severity="info" label={entry.action} />
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-slate-900 block">{entry.actorName}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{entry.actorRole}</span>
                        </td>
                        <td className="p-3">
                          {entry.parcelUlpin ? (
                            <PlotTag ulpin={entry.parcelUlpin} size="sm" />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3 max-w-xs truncate" title={entry.details}>
                          {entry.details}
                        </td>
                        <td className="p-3 font-mono">
                          <CopyHashPill hash={entry.currentHash} truncateLength={6} />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setExpandedIndex(isExpanded ? null : entry.blockIndex)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            aria-label="Expand row"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Full Block Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={7} className="p-4 space-y-3 text-xs border-y border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="font-bold text-slate-600 uppercase text-[10px] block">{t('ledgerPrevHash')}</span>
                                <CopyHashPill hash={entry.previousHash} />
                              </div>
                              <div className="space-y-1">
                                <span className="font-bold text-slate-600 uppercase text-[10px] block">{t('ledgerHash')}</span>
                                <CopyHashPill hash={entry.currentHash} />
                              </div>
                            </div>

                            {entry.metadataPayload && (
                              <div>
                                <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1">{t('anchoredPayloadMetadata')}</span>
                                <pre className="p-2.5 bg-white rounded border border-slate-200 text-[10px] font-mono text-slate-800 overflow-x-auto">
                                  {JSON.stringify(entry.metadataPayload, null, 2)}
                                </pre>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
