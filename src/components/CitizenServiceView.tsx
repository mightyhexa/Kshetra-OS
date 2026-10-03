import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { Parcel, ServiceRequest, ServiceRequestStatus, ServiceRequestType } from '../types';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  ExternalLink,
  ChevronRight,
  FileCheck,
  Download,
  Send
} from 'lucide-react';

interface CitizenServiceViewProps {
  onViewParcelOnMap: (ulpin: string) => void;
  preselectedUlpin?: string;
  onOpenDossier?: (parcel: Parcel) => void;
}

const STATUS_STEPS: { key: ServiceRequestStatus; label: string; description: string }[] = [
  { key: 'SUBMITTED', label: 'Applied', description: 'Application received and token generated' },
  { key: 'UNDER_DEPARTMENTAL_REVIEW', label: 'Under Review', description: 'Spatial survey and revenue field inspection' },
  { key: 'CROSS_VERIFIED', label: 'Cross-Verified', description: 'Multi-agency signoff (Survey + Stamps + Tax)' },
  { key: 'APPROVED', label: 'Registered / Complete', description: 'Official mutation order issued and ledger updated' }
];

export const CitizenServiceView: React.FC<CitizenServiceViewProps> = ({
  onViewParcelOnMap,
  preselectedUlpin,
  onOpenDossier
}) => {
  const { currentUser, currentRole } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form State for New Service Request
  const [targetUlpin, setTargetUlpin] = useState(preselectedUlpin || '');
  const [requestType, setRequestType] = useState<ServiceRequestType>('MUTATION_OF_TITLE');
  const [urgency, setUrgency] = useState<'Normal' | 'Tatkal'>('Normal');
  const [applicantName, setApplicantName] = useState(currentUser.fullName);
  const [applicantAadhaar, setApplicantAadhaar] = useState(currentUser.aadhaarMasked || 'XXXX-XXXX-9182');
  const [supportingDoc, setSupportingDoc] = useState('Registered_Conveyance_Deed.pdf');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [parcelsRes, reqs] = await Promise.all([
        apiClient.getParcels({ limit: 100 }),
        apiClient.getRequests()
      ]);
      setParcels(parcelsRes.items);
      setRequests(reqs);
      if (reqs.length > 0 && !selectedRequestId) {
        setSelectedRequestId(reqs[0].id);
      }
      if (parcelsRes.items.length > 0 && !targetUlpin) {
        setTargetUlpin(preselectedUlpin || parcelsRes.items[0].ulpin);
      }
    } catch (err) {
      console.error('Failed to load citizen data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [preselectedUlpin]);

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newReq = await apiClient.createRequest({
        parcelUlpin: targetUlpin,
        applicantName,
        applicantAadhaarMasked: applicantAadhaar || currentUser.aadhaarMasked || 'XXXX-XXXX-9182',
        requestType,
        urgency,
        supportingDocName: supportingDoc
      });
      await loadData();
      setSelectedRequestId(newReq.id);
      setIsSubmitModalOpen(false);
      setSubmitSuccessNotice(`Application ${newReq.id} submitted successfully and committed to the SHA-256 ledger!`);
      setTimeout(() => setSubmitSuccessNotice(null), 8000);
    } catch (err: any) {
      console.error('Failed to submit request:', err);
    }
  };

  const getStepStatus = (stepKey: ServiceRequestStatus, currentStatus: ServiceRequestStatus) => {
    const order: ServiceRequestStatus[] = ['SUBMITTED', 'UNDER_DEPARTMENTAL_REVIEW', 'CROSS_VERIFIED', 'APPROVED'];
    const currentIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);

    if (currentStatus === 'REJECTED') {
      return stepIdx === 0 ? 'completed' : 'rejected';
    }
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner Notice: Honest PS26014 Clarification */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B3D6E]">
              Citizen Public Service Portal
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              Simulated Inter-Agency Workflow
            </span>
          </div>
          <p className="text-xs text-slate-600">
            End-to-end digital land governance: submit title mutations, encumbrance certificates, and demarcation requests with live cross-departmental verification.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B3D6E] hover:bg-[#092f55] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Service Application</span>
        </button>
      </div>

      {submitSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{submitSuccessNotice}</span>
          </div>
          <button
            onClick={() => setSubmitSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Application List (Left) & Real Transaction Tracker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Applications List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0B3D6E]" />
              <span>Tracked Service Requests ({requests.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Live Registry</span>
          </div>

          <div className="space-y-2.5">
            {requests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-white border-[#0B3D6E] shadow-md ring-1 ring-[#0B3D6E]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-xs">{req.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : req.status === 'CROSS_VERIFIED'
                        ? 'bg-blue-100 text-[#0B3D6E]'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-1.5 font-semibold text-slate-800">
                    {req.requestType.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    ULPIN: {req.parcelUlpin}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Applicant: {req.applicantName}</span>
                    <span>{new Date(req.submittedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Stepper & Departmental Transition History */}
        <div className="lg:col-span-7">
          {selectedRequest ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-[#0B3D6E]">
                      {selectedRequest.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {selectedRequest.urgency} Urgency
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mt-1">
                    {selectedRequest.requestType.replace(/_/g, ' ')}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>Target Parcel ULPIN:</span>
                    <button
                      onClick={() => onViewParcelOnMap(selectedRequest.parcelUlpin)}
                      className="font-mono text-[#0B3D6E] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      {selectedRequest.parcelUlpin}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {onOpenDossier && (
                      <button
                        onClick={() => {
                          const found = parcels.find(p => p.ulpin === selectedRequest.parcelUlpin);
                          if (found) onOpenDossier(found);
                        }}
                        className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-semibold inline-flex items-center gap-1 shadow-2xs"
                        title="Download Official Government Dossier (PDF)"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Dossier PDF</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Current Status</span>
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                    selectedRequest.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedRequest.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedRequest.status === 'CROSS_VERIFIED'
                      ? 'bg-blue-100 text-[#0B3D6E]'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedRequest.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* REAL STEPPER (State Machine) */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Real-Time Inter-Departmental Progression
                </h4>

                <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
                  {STATUS_STEPS.map((step, idx) => {
                    const statusState = getStepStatus(step.key, selectedRequest.status);
                    const matchingTransition = selectedRequest.history.find(h => h.toStatus === step.key);

                    return (
                      <div key={step.key} className="relative">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 text-[10px] font-bold ${
                            statusState === 'completed'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : statusState === 'current'
                              ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}
                        >
                          {statusState === 'completed' ? '✓' : idx + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${
                              statusState === 'current' ? 'text-[#0B3D6E]' : 'text-slate-800'
                            }`}>
                              {step.label}
                            </span>
                            {matchingTransition && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {new Date(matchingTransition.timestamp).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{step.description}</p>

                          {/* Specific Departmental Action Remark if transition occurred */}
                          {matchingTransition && (
                            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-700 flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-[#0B3D6E]" />
                                  Department: {matchingTransition.department}
                                </span>
                                <span className="text-slate-500 font-medium">
                                  By: {matchingTransition.actionedByName}
                                </span>
                              </div>
                              <p className="text-slate-600 italic">"{matchingTransition.remarks}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verified Documents Attached */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-semibold text-slate-700 block">Attached Cadastral Instruments & Proofs:</span>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#0B3D6E]" />
                    <span className="font-medium text-slate-800">{selectedRequest.supportingDocName}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Digitally Sealed
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select an application from the left to view real-time state machine history.
            </div>
          )}
        </div>
      </div>

      {/* NEW SERVICE REQUEST MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#0B3D6E]" />
                <span>Submit Land Governance Service Request</span>
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target Parcel ULPIN</label>
                <select
                  value={targetUlpin}
                  onChange={(e) => setTargetUlpin(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:ring-1 focus:ring-[#0B3D6E]"
                >
                  {parcels.map((p) => (
                    <option key={p.ulpin} value={p.ulpin}>
                      {p.ulpin} — {p.district} (Survey {p.surveyNumber}, {p.ownership.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Service Request Category</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as ServiceRequestType)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium text-xs focus:ring-1 focus:ring-[#0B3D6E]"
                >
                  <option value="MUTATION_OF_TITLE">Mutation of Title (Registered Deed Transfer)</option>
                  <option value="ENCUMBRANCE_CERTIFICATE">Encumbrance Certificate (Form 15 Search)</option>
                  <option value="BOUNDARY_DEMARCATION">Boundary Demarcation & Digital Survey</option>
                  <option value="LAND_CONVERSION_CLU">Change of Land Use (CLU / Conversion)</option>
                  <option value="TAX_RECORD_RECTIFICATION">Fiscal / Property Tax Assessment Rectification</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Applicant Full Name</label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Masked Aadhaar ID</label>
                  <input
                    type="text"
                    value={applicantAadhaar}
                    onChange={(e) => setApplicantAadhaar(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Processing Priority</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as 'Normal' | 'Tatkal')}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
                  >
                    <option value="Normal">Normal Track (7-14 Days)</option>
                    <option value="Tatkal">Tatkal Fast-Track (48 Hours)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Supporting Deed / Instrument</label>
                  <input
                    type="text"
                    value={supportingDoc}
                    onChange={(e) => setSupportingDoc(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                Notice: Submitting will append a new transaction directly into the state machine and seal the event into the tamper-proof SHA-256 audit ledger.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B3D6E] hover:bg-[#082a4d] text-white font-semibold rounded-lg shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
