import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { Parcel, ServiceRequest, ServiceRequestType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from './ui/Toast';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { PlotTag } from './ui/PlotTag';
import { CopyHashPill } from './ui/CopyHashPill';
import { Skeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { 
  FilePlus, 
  Upload, 
  Download, 
  FileCheck2,
  MapPin
} from 'lucide-react';

interface CitizenServiceViewProps {
  onViewParcelOnMap?: (ulpin: string) => void;
  preselectedUlpin?: string;
  onOpenDossier?: (parcel: Parcel) => void;
}

const SERVICE_TYPES: { id: ServiceRequestType; label: string; description: string; slaDays: number }[] = [
  { id: 'MUTATION_OF_TITLE', label: 'Mutation of Title (Khata Transfer)', description: 'Transfer of title ownership upon registered conveyance sale or inheritance deed.', slaDays: 15 },
  { id: 'ENCUMBRANCE_CERTIFICATE', label: 'Encumbrance Certificate (Form 15)', description: 'Certified 30-year non-encumbrance or financial charge certificate.', slaDays: 3 },
  { id: 'BOUNDARY_DEMARCATION', label: 'Cadastral Boundary Demarcation', description: 'Total-station DGPS spatial pegging of cadastral boundary coordinates.', slaDays: 21 },
  { id: 'LAND_CONVERSION_CLU', label: 'Change of Land Use (CLU Permission)', description: 'Statutory master plan zoning conversion from agricultural to residential/commercial.', slaDays: 30 }
];

export const CitizenServiceView: React.FC<CitizenServiceViewProps> = ({
  onViewParcelOnMap,
  preselectedUlpin,
  onOpenDossier
}) => {
  const { t } = useLanguage();
  const { success, error: toastError } = useToast();

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceRequestType>('MUTATION_OF_TITLE');
  const [targetUlpin, setTargetUlpin] = useState<string>(preselectedUlpin || '');
  const [remarks, setRemarks] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedReceiptHash, setUploadedReceiptHash] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (preselectedUlpin) setTargetUlpin(preselectedUlpin);
  }, [preselectedUlpin]);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [parcelRes, requestList] = await Promise.all([
        apiClient.getParcels({ limit: 50 }),
        apiClient.getRequests()
      ]);
      setParcels(parcelRes.items);
      setRequests(requestList);
      if (!targetUlpin && parcelRes.items.length > 0) {
        setTargetUlpin(parcelRes.items[0].ulpin);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load citizen services data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUlpin) {
      toastError('Selection Required', 'Please select a target cadastral parcel.');
      return;
    }

    setIsSubmitting(true);
    try {
      let documentHash: string | undefined;

      // 1. Upload statutory file if attached
      if (uploadFile) {
        const uploadRes = await apiClient.uploadDocument(uploadFile, targetUlpin);
        documentHash = uploadRes.data?.sha256;
        setUploadedReceiptHash(documentHash || null);
      }

      // 2. Create Service Request
      await apiClient.createRequest({
        parcelUlpin: targetUlpin,
        applicantName: 'Rajesh K. Verma',
        applicantAadhaarMasked: 'XXXX-XXXX-0019',
        requestType: selectedServiceType,
        urgency: 'Normal',
        supportingDocName: uploadFile?.name
      });

      success('Application Submitted', 'Service request lodged and anchored in SHA-256 ledger.');
      setRemarks('');
      setUploadFile(null);
      await loadData();
    } catch (err: any) {
      toastError('Submission Failed', err.message || 'Failed to submit service application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton variant="rectangular" className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <Skeleton variant="rectangular" className="h-80 w-full" />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <Skeleton variant="rectangular" className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <ErrorState
          title="Citizen Services Unavailable"
          message={errorMsg}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#0B3D6E]">
            {t('citizenServicesTitle')}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            {t('citizenServicesSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Chip severity="clear" label="Self-Service Portal" />
          <span className="text-xs text-slate-500 font-mono">Real-Time SLA</span>
        </div>
      </div>

      {/* Main Grid: Apply Form Left, Applications List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT (Col 5): Apply for a Cadastral Service */}
        <div className="lg:col-span-5">
          <Card variant="accent" className="p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
              <FilePlus className="w-5 h-5 text-[#0B3D6E]" />
              <h2 className="font-serif text-base font-bold text-[#0F172A]">
                {t('applyNewService')}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Service Type Selection */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('selectServiceType')}
                </label>
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value as ServiceRequestType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3D6E] bg-white font-medium"
                >
                  {SERVICE_TYPES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label} (SLA: {st.slaDays} Days)
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Land Parcel Picker */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('selectParcel')}
                </label>
                <select
                  value={targetUlpin}
                  onChange={(e) => setTargetUlpin(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0B3D6E] bg-white"
                  required
                >
                  {parcels.map((p) => (
                    <option key={p.ulpin} value={p.ulpin}>
                      {p.displayUlpin} · Survey #{p.surveyNumber} ({p.villageWard}, {p.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Remarks / Justification */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('remarksLabel')}
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Provide registered deed execution date, sub-registrar receipt number, or survey pegs detail..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3D6E]"
                />
              </div>

              {/* Real Statutory File Upload */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {t('uploadEvidenceFile')}
                </label>
                <div className="p-3 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-[#0B3D6E] bg-slate-50/50 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0B3D6E] file:text-white hover:file:bg-[#082a4d] cursor-pointer"
                  />
                  {uploadFile && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                      Ready to anchor: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isSubmitting}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                {t('actionSubmit')}
              </Button>
            </form>
          </Card>
        </div>

        {/* RIGHT (Col 7): Applications List & Live Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-[#0B3D6E]">
              {t('myApplications')} ({requests.length})
            </h2>
            <span className="text-xs text-slate-500">{t('statutorySlaCompliance')}</span>
          </div>

          {requests.length === 0 ? (
            <EmptyState
              icon={<FileCheck2 className="w-8 h-8 text-slate-400" />}
              title="No Active Applications"
              description="You have not submitted any cadastral service applications. Select a parcel on the left to initiate e-Mutation."
            />
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const statusSeverity = 
                  req.status === 'Approved' ? 'clear' :
                  req.status === 'Rejected' ? 'rose' :
                  req.status === 'Cross Verified' ? 'info' : 'amber';

                const targetParcel = parcels.find(p => p.ulpin === req.parcelUlpin);
                const lastRemark = req.history?.[req.history.length - 1]?.remarks || req.history?.[0]?.remarks;

                return (
                  <Card
                    key={req.id}
                    variant="default"
                    className="p-4 space-y-3 hover:border-slate-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {req.id}
                          </span>
                          <Chip
                            size="sm"
                            severity={statusSeverity}
                            label={req.status}
                          />
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(req.submittedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 text-xs mt-1">
                          {req.requestType.replace(/_/g, ' ')}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onViewParcelOnMap && (
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<MapPin className="w-3.5 h-3.5" />}
                            onClick={() => onViewParcelOnMap(req.parcelUlpin)}
                          >
                            Map
                          </Button>
                        )}
                        {req.status === 'Approved' && targetParcel && onOpenDossier && (
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<Download className="w-3.5 h-3.5" />}
                            onClick={() => onOpenDossier(targetParcel)}
                          >
                            {t('downloadCertificate')}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Parcel PlotTag */}
                    <div className="flex items-center gap-2 text-xs">
                      <PlotTag ulpin={req.parcelUlpin} size="sm" />
                      {uploadedReceiptHash && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <span className="font-semibold">{t('receiptHash')}</span>
                          <CopyHashPill hash={uploadedReceiptHash} truncateLength={6} />
                        </div>
                      )}
                    </div>

                    {/* Remarks from history */}
                    {lastRemark && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                        "{lastRemark}"
                      </p>
                    )}

                    {/* Visual SLA Workflow Timeline */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                        {[
                          { key: 'Applied', label: '1. Applied' },
                          { key: 'Under Review', label: '2. Review' },
                          { key: 'Cross Verified', label: '3. Verified' },
                          { key: 'Approved', label: '4. Approved' }
                        ].map((step, idx) => {
                          const stages = ['Applied', 'Under Review', 'Cross Verified', 'Approved'];
                          const currentIdx = stages.indexOf(req.status);
                          const isPassed = currentIdx >= idx;
                          const isCurrent = req.status === step.key;

                          return (
                            <div
                              key={step.key}
                              className={`p-1.5 rounded font-semibold transition-colors ${
                                isCurrent
                                  ? 'bg-[#0B3D6E] text-white shadow-2xs'
                                  : isPassed
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {step.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
