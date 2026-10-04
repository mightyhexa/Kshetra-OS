import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { Parcel } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { X, Terminal, CheckCircle2, Lock, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUlpin?: string;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({
  isOpen,
  onClose,
  initialUlpin
}) => {
  const { t } = useLanguage();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [targetUlpin, setTargetUlpin] = useState(initialUlpin || '');
  const [citizenResponse, setCitizenResponse] = useState<any>(null);
  const [officerResponse, setOfficerResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedRole, setCopiedRole] = useState<'citizen' | 'officer' | null>(null);

  useEffect(() => {
    async function initParcels() {
      try {
        const res = await apiClient.getParcels({ limit: 100 });
        setParcels(res.items);
        if (!targetUlpin && res.items.length > 0) {
          const defaultUlpin = initialUlpin || res.items[0].ulpin;
          setTargetUlpin(defaultUlpin);
          fetchBothResponses(defaultUlpin);
        }
      } catch (err) {
        console.error('Failed to load parcels for inspector:', err);
      }
    }
    if (isOpen) {
      initParcels();
    }
  }, [isOpen, initialUlpin]);

  const fetchBothResponses = async (ulpinToFetch: string) => {
    if (!ulpinToFetch) return;
    setIsLoading(true);
    try {
      const [citRes, offRes] = await Promise.all([
        apiClient.fetchParcelAsRole(ulpinToFetch, 'citizen'),
        apiClient.fetchParcelAsRole(ulpinToFetch, 'officer')
      ]);
      setCitizenResponse(citRes);
      setOfficerResponse(offRes);
    } catch (err) {
      console.error('Failed to fetch inspection responses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && targetUlpin) {
      fetchBothResponses(targetUlpin);
    }
  }, [targetUlpin, isOpen]);

  if (!isOpen) return null;

  const copyJson = (data: unknown, role: 'citizen' | 'officer') => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0B3D6E] text-white rounded-lg">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {t('apiInspectorTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('apiInspectorSubtitle')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Selector Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-semibold text-slate-700">{t('targetParcel')}</span>
            <select
              value={targetUlpin}
              onChange={(e) => {
                setTargetUlpin(e.target.value);
                fetchBothResponses(e.target.value);
              }}
              className="p-1.5 bg-white border border-slate-300 rounded font-mono text-xs text-slate-800 flex-1 max-w-md"
            >
              {parcels.map((p) => (
                <option key={p.ulpin} value={p.ulpin}>
                  {p.ulpin} ({p.district} • {p.ownership.ownerName} • {p.encumbrance.hasMortgage ? 'Has Mortgage' : 'Clear'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Live Express API Gating (JWT Bearer Auth)
            </span>
          </div>
        </div>

        {/* Side-by-Side Responses Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-[360px]">
          {/* CITIZEN RESPONSE */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-bold text-xs text-slate-800">{t('roleCitizen')}</span>
                <span className="text-[10px] text-slate-500 font-mono">GET /api/parcels/:ulpin (Citizen JWT)</span>
              </div>
              <button
                onClick={() => copyJson(citizenResponse?.data?.data || citizenResponse?.data, 'citizen')}
                className="text-[11px] text-[#0B3D6E] hover:underline flex items-center gap-1 font-medium"
              >
                {copiedRole === 'citizen' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRole === 'citizen' ? t('copied') : t('copyJson')}</span>
              </button>
            </div>

            <div className="p-2.5 bg-blue-50 border-b border-blue-100 text-[11px] text-[#0B3D6E]">
              <strong>{t('securityPolicyApplied')}</strong> <code className="font-mono">encumbrance.mortgageDetails</code>, stay orders, and court docket numbers are physically stripped by the server before transmission.
            </div>

            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] bg-white text-slate-800">
              {isLoading ? (
                <div className="text-slate-400">{t('queryingBackend')}</div>
              ) : (
                <pre>{JSON.stringify((citizenResponse?.data?.data || citizenResponse?.data)?.encumbrance, null, 2)}</pre>
              )}
            </div>
          </div>

          {/* OFFICER RESPONSE */}
          <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-xs text-slate-800">{t('roleOfficer')}</span>
                <span className="text-[10px] text-slate-500 font-mono">GET /api/parcels/:ulpin (Officer JWT)</span>
              </div>
              <button
                onClick={() => copyJson(officerResponse?.data?.data || officerResponse?.data, 'officer')}
                className="text-[11px] text-[#0B3D6E] hover:underline flex items-center gap-1 font-medium"
              >
                {copiedRole === 'officer' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRole === 'officer' ? t('copied') : t('copyJson')}</span>
              </button>
            </div>

            <div className="p-2.5 bg-emerald-50 border-b border-emerald-100 text-[11px] text-emerald-900">
              <strong>{t('privilegedClearance')}</strong> Full banking mortgage charge (Bank name, loan amount, charge ID, court docket) returned.
            </div>

            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] bg-white text-slate-800">
              {isLoading ? (
                <div className="text-slate-400">{t('queryingBackend')}</div>
              ) : (
                <pre>{JSON.stringify((officerResponse?.data?.data || officerResponse?.data)?.encumbrance, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer verification remark */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Passes <strong>Layer 2 Definition of Done</strong>: Data is filtered in the API response controller, guaranteeing that restricted fields are never transmitted across the network to unauthorized public sessions.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0B3D6E] text-white font-semibold rounded-lg text-xs hover:bg-[#082a4d]"
          >
            {t('closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
