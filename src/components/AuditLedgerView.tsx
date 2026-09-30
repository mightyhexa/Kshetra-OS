import React, { useState } from 'react';
import { auditLedger } from '../services/auditLedger';
import { AuditLedgerEntry } from '../types';
import { 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Download, 
  RefreshCw, 
  Hash, 
  Lock, 
  Clock 
} from 'lucide-react';

export const AuditLedgerView: React.FC = () => {
  const [entries, setEntries] = useState<ReadonlyArray<AuditLedgerEntry>>(() => auditLedger.getEntries());
  const [searchFilter, setSearchFilter] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    verifiedBlocks: number;
    timestamp: string;
  } | null>(null);

  const refreshEntries = () => {
    setEntries(auditLedger.getEntries());
  };

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    // Simulate brief cryptographic computation delay for UI clarity
    await new Promise((resolve) => setTimeout(resolve, 300));
    const result = await auditLedger.verifyIntegrity();
    setVerificationResult({
      isValid: result.isValid,
      verifiedBlocks: result.verifiedBlocks,
      timestamp: new Date().toLocaleTimeString('en-IN')
    });
    setIsVerifying(false);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `landstack_audit_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Ledger Architecture Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B3D6E]">
              Tamper-Evident SHA-256 Audit Ledger
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#0B3D6E] font-semibold border border-blue-200">
              Append-Only • No Mutation Allowed
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">
            National Spatial Data Infrastructure Cadastral Log
          </h1>
          <p className="text-xs text-slate-500">
            Every parcel lookup, role elevation, service submission, and departmental mutation is cryptographically chained with SHA-256 hash proofs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleVerifyIntegrity}
            disabled={isVerifying}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Cryptographic Integrity'}</span>
          </button>

          <button
            onClick={refreshEntries}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors"
            title="Refresh Entries"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors"
            title="Export Ledger as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Verification Seal Status Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            verificationResult.isValid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <span className="font-bold block">
                {verificationResult.isValid
                  ? 'Cryptographic Chain Integrity Verified (100% Pass)'
                  : 'Ledger Tamper Detected! Chain Discontinuity'}
              </span>
              <span className="text-[11px] text-slate-600">
                Verified {verificationResult.verifiedBlocks} sequential blocks from Genesis Block 0 to Tip at{' '}
                {verificationResult.timestamp}. All SHA-256 hashes match.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-white border border-slate-200 font-semibold">
            Algorithm: SHA-256 (FIPS 180-4)
          </span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 pl-1" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter ledger by action, actor, parcel ULPIN, or SHA-256 hash prefix..."
          className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
        />
        {searchFilter && (
          <button
            onClick={() => setSearchFilter('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Ledger Block Cards List */}
      <div className="space-y-3">
        {filteredEntries.map((block, index) => (
          <div
            key={block.blockIndex}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs space-y-3 hover:border-slate-300 transition-colors"
          >
            {/* Block Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#0B3D6E] text-white font-mono font-bold rounded text-[11px]">
                  Block #{block.blockIndex}
                </span>
                <span className="font-semibold text-slate-800">{block.action.replace(/_/g, ' ')}</span>
                {block.parcelUlpin && (
                  <span className="font-mono text-[#0B3D6E] bg-blue-50 px-1.5 py-0.5 rounded text-[11px] font-medium">
                    {block.parcelUlpin}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <Clock className="w-3 h-3" />
                <span>{new Date(block.timestamp).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Block Content Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block">Actor & Role</span>
                <span className="font-medium text-slate-900">{block.actorName}</span>
                <span className="text-[10px] text-slate-500 block capitalize">
                  {block.actorRole.replace('_', ' ')} ({block.actorId})
                </span>
              </div>

              <div className="md:col-span-2">
                <span className="text-[11px] text-slate-400 block">Transaction Detail</span>
                <p className="text-slate-700">{block.details}</p>
              </div>
            </div>

            {/* Cryptographic Hashes Chaining */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 font-mono text-[10px]">
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                <span className="text-slate-400 font-semibold w-24 shrink-0">Current Hash:</span>
                <span className="text-emerald-700 font-bold truncate">{block.currentHash}</span>
              </div>
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                <span className="text-slate-400 font-semibold w-24 shrink-0">Previous Hash:</span>
                <span className="text-slate-500 truncate">{block.previousHash}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
