import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { landStackApi } from '../services/api';
import { workflowEngine } from '../services/workflowEngine';
import { MOCK_PARCELS } from '../data/mockParcels';
import { computeParcelFlags } from '../services/riskEngine';
import { Parcel, ServiceRequest, ServiceRequestStatus, WorkflowTransition } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  Layers, 
  ArrowUpRight,
  Send,
  Building,
  Activity
} from 'lucide-react';

interface OfficerDashboardProps {
  onViewParcelOnMap: (ulpin: string) => void;
  onOpenDossier?: (parcel: Parcel) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ 
  onViewParcelOnMap,
  onOpenDossier 
}) => {
  const { currentRole, currentUser, switchRole } = useAuth();
  const [stats, setStats] = useState(() => landStackApi.getAdminStats());
  const [requests, setRequests] = useState<ServiceRequest[]>(() => workflowEngine.getAllRequests());
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // If user is Citizen, show role gating protection screen (PS Layer 2 requirement!)
  if (currentRole === 'citizen') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Role-Gated Officer & Administrative Console
        </h2>
        <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
          Access to departmental case workflows, encumbrance banking charges, judicial docket logs, and cadastral spatial analytics is restricted to authenticated <strong>Land Officers (Tahsildars)</strong> and <strong>Policy Administrators</strong> under SIH26014 role governance.
        </p>
        <div className="pt-2">
          <button
            onClick={() => switchRole('officer')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B3D6E] hover:bg-[#082a4d] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Elevate Session to Land Officer (Demo Mode)</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle Workflow Action (Cross-verify / Approve / Reject)
  const handleWorkflowAction = async (nextStatus: ServiceRequestStatus, department: WorkflowTransition['department']) => {
    if (!selectedRequest) return;

    await workflowEngine.transitionRequest({
      requestId: selectedRequest.id,
      nextStatus,
      department,
      actorRole: currentRole,
      actorName: currentUser.fullName,
      actorId: currentUser.id,
      remarks: actionRemarks || `Administrative ${nextStatus.replace(/_/g, ' ')} authorized by ${currentUser.fullName}`
    });

    const updated = workflowEngine.getAllRequests();
    setRequests(updated);
    setStats(landStackApi.getAdminStats());
    setSelectedRequest(null);
    setActionRemarks('');
    setActionSuccessNotice(`Application ${selectedRequest.id} moved to ${nextStatus.replace(/_/g, ' ')} and hashed into the audit ledger.`);
    setTimeout(() => setActionSuccessNotice(null), 6000);
  };

  // Compute list of flagged parcels
  const flaggedParcels = MOCK_PARCELS.map(p => ({
    parcel: p,
    flags: computeParcelFlags(p)
  })).filter(item => item.flags.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Officer Header Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B3D6E]">
              Officer Cadastral Command Console
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#0B3D6E] font-semibold border border-blue-200">
              Role: {currentRole === 'policy_admin' ? 'Policy Administrator' : 'Land Officer (Tahsildar)'}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">
            {currentUser.fullName} {currentUser.designation ? `— ${currentUser.designation}` : ''}
          </h1>
          <p className="text-xs text-slate-500">
            Jurisdiction: {currentUser.jurisdictionDistrict}, {currentUser.jurisdictionState} • Badge ID: {currentUser.officerBadgeId || 'GOV-CAD-09'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NSDI GIS Sync Online</span>
          </div>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessNotice}</span>
          </div>
          <button
            onClick={() => setActionSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Layer 5: Real Computed KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs block">Parcels Indexed</span>
          <span className="text-xl font-bold text-slate-900">{stats.totalParcelsIndexed}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Across {stats.totalStatesCovered} States</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs block">Active Disputes</span>
          <span className="text-xl font-bold text-rose-600">{stats.activeDisputeCount}</span>
          <span className="text-[10px] text-rose-600 block mt-0.5">In Court Adjudication</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs block">Flagged Parcels</span>
          <span className="text-xl font-bold text-amber-600">{stats.flaggedParcelsCount}</span>
          <span className="text-[10px] text-amber-600 block mt-0.5">Zoning/Tax/Stale</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs block">Pending Review</span>
          <span className="text-xl font-bold text-blue-600">{stats.pendingReviewCount}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Awaiting Action</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs block">Approved Requests</span>
          <span className="text-xl font-bold text-emerald-600">{stats.approvedCount}</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Legally Mutated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 text-xs block">Avg Turnaround</span>
          <span className="text-xl font-bold text-slate-900">{stats.averageTurnaroundDays}d</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">DPI Benchmark</span>
        </div>
      </div>

      {/* Main Grid: Workflow Verification Station (Left) & Flagged Parcels Registry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Departmental Service Request Action Station */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0B3D6E]" />
                <span>Departmental Verification & Mutation Action Station</span>
              </h2>
              <p className="text-xs text-slate-500">
                Action pending citizen service requests to advance the cross-agency state machine.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0B3D6E] bg-blue-50 px-2 py-1 rounded">
              {requests.length} Total
            </span>
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs space-y-2.5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{req.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-800">{req.requestType.replace(/_/g, ' ')}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block">Target ULPIN</span>
                    <button
                      onClick={() => onViewParcelOnMap(req.parcelUlpin)}
                      className="font-mono text-[#0B3D6E] font-medium hover:underline inline-flex items-center gap-0.5"
                    >
                      {req.parcelUlpin} <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Applicant</span>
                    <span className="font-medium text-slate-900">{req.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Submitted On</span>
                    <span>{new Date(req.submittedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Action Triggers for Pending / Review Requests */}
                {req.status !== 'APPROVED' && req.status !== 'REJECTED' && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="text-xs font-semibold text-[#0B3D6E] hover:underline"
                    >
                      {selectedRequest?.id === req.id ? 'Cancel Action' : 'Authorize Workflow Transition →'}
                    </button>

                    {selectedRequest?.id === req.id && (
                      <div className="w-full mt-2 p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <label className="block text-[11px] font-semibold text-slate-700">
                          Officer Verification Remarks / Minute:
                        </label>
                        <input
                          type="text"
                          value={actionRemarks}
                          onChange={(e) => setActionRemarks(e.target.value)}
                          placeholder="e.g. Survey verified by Tahsildar; Revenue dues clear."
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                        />
                        <div className="flex items-center gap-2 pt-1">
                          {req.status === 'SUBMITTED' && (
                            <button
                              onClick={() => handleWorkflowAction('UNDER_DEPARTMENTAL_REVIEW', 'Land Records & Survey')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                            >
                              Move to Under Review
                            </button>
                          )}
                          {req.status === 'UNDER_DEPARTMENTAL_REVIEW' && (
                            <button
                              onClick={() => handleWorkflowAction('CROSS_VERIFIED', 'Sub-Registrar (Stamps)')}
                              className="px-3 py-1.5 bg-[#0B3D6E] hover:bg-[#082a4d] text-white rounded text-xs font-semibold"
                            >
                              Cross-Verify Multi-Agency
                            </button>
                          )}
                          {(req.status === 'CROSS_VERIFIED' || req.status === 'UNDER_DEPARTMENTAL_REVIEW') && (
                            <button
                              onClick={() => handleWorkflowAction('APPROVED', 'Revenue & Fiscal')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                            >
                              Grant Final Approval & Mutate
                            </button>
                          )}
                          <button
                            onClick={() => handleWorkflowAction('REJECTED', 'Town Planning (GIS)')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                          >
                            Reject Application
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Layer 3 Explainable Flagged Parcels Registry */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Rule-Based Cadastral Risk Registry ({flaggedParcels.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Parcels triggered by explainable deterministic governance rules.
            </p>
          </div>

          <div className="space-y-3">
            {flaggedParcels.map(({ parcel, flags }) => (
              <div
                key={parcel.ulpin}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{parcel.ulpin}</span>
                  <div className="flex items-center gap-2">
                    {onOpenDossier && (
                      <button
                        onClick={() => onOpenDossier(parcel)}
                        className="text-xs px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium flex items-center gap-1 shadow-2xs"
                        title="View Official Government Dossier"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Dossier PDF</span>
                      </button>
                    )}
                    <button
                      onClick={() => onViewParcelOnMap(parcel.ulpin)}
                      className="text-[#0B3D6E] hover:underline font-semibold flex items-center gap-0.5 text-[11px]"
                    >
                      View on Map <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">
                  {parcel.district} • Survey {parcel.surveyNumber} ({parcel.ownership.ownerName})
                </div>

                <div className="space-y-1.5 pt-1">
                  {flags.map((flag) => (
                    <div
                      key={flag.code}
                      className={`p-2 rounded-lg border text-[11px] ${
                        flag.severity === 'high'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : flag.severity === 'medium'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-blue-50 border-blue-200 text-blue-900'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{flag.title}</span>
                      </div>
                      <p className="mt-0.5 text-slate-700">{flag.reason}</p>
                      <div className="mt-1 font-mono text-[9px] text-slate-500">
                        Trigger: {flag.triggeredFields.join(' | ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
