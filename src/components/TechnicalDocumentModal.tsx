import React, { useState } from 'react';
import { X, BookOpen, Download, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';

interface TechnicalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalDocumentModal: React.FC<TechnicalDocumentModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'api' | 'interop' | 'schemas' | 'arch' | 'gis' | 'security' | 'uiux' | 'deployment'>('api');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownloadMarkdown = () => {
    const markdownContent = `# SIH26014 — KSHETRA OS Standard Technical Document
**Integrated GIS-based Digital Public Infrastructure for Land Governance**
Ministry of Rural Development / Department of Land Resources (MoRD / DoLR)

## 1. API Standards
- GET /api/parcels/search?q={query}: Spatial and textual query against ULPIN, Survey No, District, and Owner.
- GET /api/parcels/{ulpin}?role={citizen|officer}: Cadastral 3-tier joined record. Server-side role-gating strips sensitive mortgage banking details for citizen sessions.
- POST /api/requests: Cross-agency service request submission with automatic append to SHA-256 ledger.
- GET /api/admin/stats: Real aggregate metrics computed across the indexed parcel dataset and audit ledger.
- GET /api/audit/ledger: Tamper-evident immutable block sequence with SHA-256 hash chaining.

## 2. Interoperability Standards
Models interoperability across 4 simulated agency nodes:
1. Department of Land Records & Survey (Cadastral boundaries, village map sheets).
2. Inspector General of Registration & Stamps (SRO conveyance deed verification, Form 15 encumbrance search).
3. Town Planning Authorities (Master plan zoning classification, building height/FAR compliance).
4. Municipal Revenue & Fiscal (Property tax assessment PID, annual demand receipt verification).
All inter-agency transitions are logged in an immutable state machine with actor timestamps.

## 3. Data Schemas
- Parcel: ULPIN (14-digit Bhu-Aadhaar), centroid [lat, lon], areaSqm, GeoJSON Polygon, admin hierarchy.
- OwnershipRecord: ownerName, coOwners, ownershipType, registrationDate, documentNumber, SRO.
- ZoningRecord: masterPlanClassification, registeredLandUse, buildingPermissionStatus, permissible FAR.
- EncumbranceRecord: hasMortgage, mortgageDetails (role-gated), disputeFlag, courtCaseNumber, stayOrderActive.
- TaxRecord: taxStatus, lastAssessedValueInr, annualTaxDemandInr, propertyTaxAssessmentNo.
- ServiceRequest & WorkflowTransition: multi-department state transitions.

## 4. System Architecture
- Client Application: React 19 SPA with TypeScript.
- Mapping & GIS Engine: Leaflet GIS with EPSG:4326 WGS-84 vector polygon rendering.
- State & Role Gating: Server-side API simulation enforcing strict field stripping.
- Cryptographic Audit: Web Crypto API SHA-256 append-only ledger.

## 5. GIS Standards
- Unique Identifier: ULPIN (Unique Land Parcel Identification Number) / Bhu-Aadhaar.
- Spatial Coordinate Reference System (CRS): EPSG:4326 (WGS 84 Geodetic datum).
- Cadastral Parcel Geometry: GeoJSON Polygon with closed linear rings.

## 6. Security Frameworks
- Role-Based Access Control (RBAC): Citizen, Land Officer (Tahsildar), Policy Administrator.
- API-Level Field Masking: Sensitive mortgage financial data is physically omitted from JSON for public roles.
- Tamper-Evident Audit Ledger: SHA-256 append-only hash chains; zero UPDATE/DELETE paths exposed.

## 7. UI/UX Guidelines and Color Schema
- Primary Palette: National Navy (#0B3D6E), Clean Off-White Canvas (#F7F8FA), Slate Borders (#E2E8F0).
- Accent Flags: Emerald (#059669 for clear title), Amber (#D97706 for zoning discrepancy), Rose (#E11D48 for court stay order).
- Typography: System sans-serif with monospace for ULPINs, coordinates, and SHA-256 hashes. Sentence case throughout.

## 8. Deployment and Scalability Considerations
- Single-instance prototype for SIH26014 evaluation with a structured 26-parcel multi-metro dataset.
- Production Roadmap: Distributed PostGIS spatial databases, federated state-level Bhoomi/AnyRoR adapters, and e-Pramaan SSO integration.
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'KshetraOS_SIH26014_Standard_Technical_Document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('KSHETRA OS SIH26014 Technical Spec copied.');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0B3D6E] text-white rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  SIH26014 Standard Technical Document (STD)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#0B3D6E] font-semibold border border-blue-200">
                  Mandatory Deliverable
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official specification for API, interoperability, GIS, data models, and security frameworks.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-b border-slate-200 scrollbar-none">
          <button
            onClick={() => setActiveSection('api')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeSection === 'api' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. API Standards
          </button>
          <button
            onClick={() => setActiveSection('interop')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeSection === 'interop' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. Interoperability
          </button>
          <button
            onClick={() => setActiveSection('schemas')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeSection === 'schemas' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. Data Schemas
          </button>
          <button
            onClick={() => setActiveSection('arch')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeSection === 'arch' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            4. Architecture
          </button>
          <button
            onClick={() => setActiveSection('gis')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeSection === 'gis' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            5. GIS Standards
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeSection === 'security' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            6. Security & Ledger
          </button>
          <button
            onClick={() => setActiveSection('uiux')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeSection === 'uiux' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            7. UI/UX & Palette
          </button>
          <button
            onClick={() => setActiveSection('deployment')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeSection === 'deployment' ? 'bg-[#0B3D6E] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            8. Scalability
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-4">
          {activeSection === 'api' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">1. API Standards & Endpoints Built</h3>
              <p className="text-slate-600 leading-relaxed">
                All endpoints use standard RESTful semantics over HTTPS, JSON request/response payloads, and role-based clearance headers.
              </p>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-[#0B3D6E]">GET /api/parcels/search?q={'{query}'}</div>
                  <div className="text-slate-600 font-sans text-xs">
                    Matches place names, district/taluk, owner names, or ULPINs. Returns matching parcels with centroid and GeoJSON boundary.
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-[#0B3D6E]">GET /api/parcels/{'{ulpin}'}?role={'{citizen|officer}'}</div>
                  <div className="text-slate-600 font-sans text-xs">
                    Returns 3-tier joined record. Server-side role gating physically deletes <code>mortgageDetails</code> and court case numbers for <code>citizen</code> sessions.
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-[#0B3D6E]">POST /api/requests</div>
                  <div className="text-slate-600 font-sans text-xs">
                    Submits Title Mutation, Encumbrance Certificate, or Demarcation requests into the workflow state machine and commits to SHA-256 audit ledger.
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-[#0B3D6E]">GET /api/audit/ledger</div>
                  <div className="text-slate-600 font-sans text-xs">
                    Returns immutable SHA-256 chained transaction blocks for auditing and verification.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'interop' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">2. Interoperability Standards & Departmental Nodes</h3>
              <p className="text-slate-600 leading-relaxed">
                Simulates real-world data exchange across 4 distinct statutory authorities, adhering to NDAP (National Data and Analytics Platform) and India Stack protocols:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-[#0B3D6E]">Land Records & Survey</div>
                  <div className="text-slate-600 mt-1">
                    Validates boundary demarcation, village survey sheets, and GIS parcel polygons against Bhoomi / Dharani standards.
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-[#0B3D6E]">Registration & Stamps (SRO)</div>
                  <div className="text-slate-600 mt-1">
                    Verifies registered conveyance deeds, e-Stamps authenticity, and Form 15 non-encumbrance certificates.
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-[#0B3D6E]">Town Planning & Urban GIS</div>
                  <div className="text-slate-600 mt-1">
                    Enforces master plan land-use classification, permissible FAR, and checks for buffer zone violations (e.g. Rajakaluve/waterbody buffers).
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="font-bold text-[#0B3D6E]">Municipal Revenue & Fiscal</div>
                  <div className="text-slate-600 mt-1">
                    Links Property Tax Assessment PID, tracks annual fiscal clearance, and prevents fraudulent conveyances with outstanding arrears.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'schemas' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">3. Cadastral 3-Tier Data Model</h3>
              <p className="text-slate-600 leading-relaxed">
                Structured in exact alignment with the SIH26014 problem statement:
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] space-y-2">
                <div>
                  <strong className="text-slate-900 font-sans">Tier 1: Base Spatial Layer</strong>
                  <p className="text-slate-600 font-sans text-xs">
                    ULPIN (14-digit standard identifier), Survey No, Area (sqm & acres), Centroid [lat, lon], GeoJSON closed polygon coordinates, Village/Ward, Taluk, District, State.
                  </p>
                </div>
                <div>
                  <strong className="text-slate-900 font-sans">Tier 2: Essential Legal & Administrative Layers</strong>
                  <p className="text-slate-600 font-sans text-xs">
                    Record of Rights (ownerName, coOwners, freehold/leasehold tenure, registration date & deed no, SRO), Master Plan Zoning & Building Permissions (FAR, height limits), and Encumbrances (mortgage banking charge, loan amount, active court litigation stay orders).
                  </p>
                </div>
                <div>
                  <strong className="text-slate-900 font-sans">Tier 3: Additional Public Utility & Fiscal Layers</strong>
                  <p className="text-slate-600 font-sans text-xs">
                    Power Consumer ID & DISCOM (BESCOM, TSSPDCL, MSEDCL, MVVNL, Torrent), Water Supply Connection ID, Piped Natural Gas, Road Access Right-of-Way (ROW), and Municipal Property Tax Assessment PID.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'arch' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">4. System Architecture & Tech Stack</h3>
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-semibold text-slate-700">Frontend Framework:</span>
                  <span className="font-mono text-slate-900">React 19 with TypeScript & Tailwind CSS v4</span>
                </div>
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-semibold text-slate-700">GIS & Map Library:</span>
                  <span className="font-mono text-slate-900">Leaflet GIS with EPSG:4326 WGS 84 Polygon Rendering</span>
                </div>
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-semibold text-slate-700">Audit Ledger:</span>
                  <span className="font-mono text-slate-900">Append-Only SHA-256 Hash Chained Block Structure</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Access Control (RBAC):</span>
                  <span className="font-mono text-slate-900">3-Role Model (Citizen, Land Officer, Policy Admin)</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'gis' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">5. GIS & Cadastral Standards</h3>
              <p className="text-slate-600 leading-relaxed">
                Adheres strictly to the National Spatial Data Infrastructure (NSDI) and Survey of India conventions:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li><strong>ULPIN Identifier Standard:</strong> 14-digit alphanumeric code derived from coordinates and cadastral bounding box (Bhu-Aadhaar standard).</li>
                <li><strong>Spatial CRS:</strong> EPSG:4326 (WGS 84 geodetic latitude and longitude).</li>
                <li><strong>Polygon Geometry:</strong> OGC-compliant GeoJSON Linear Ring format with explicit closure where first coordinate matches the last.</li>
                <li><strong>Survey Tie-In:</strong> Every parcel maps to its state-specific revenue village survey number and sub-division letter (e.g. 142/2A).</li>
              </ul>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">6. Security & Audit Framework</h3>
              <p className="text-slate-600 leading-relaxed">
                Security and transparency are built into every layer of the prototype:
              </p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Cryptographic Audit Ledger:</strong>
                  <p className="text-slate-600 mt-1">
                    Every transaction generates a block where <code>currentHash = SHA256(index + timestamp + action + actorRole + details + previousHash)</code>. The integrity verification routine recalculates every block's hash and ensures parent link continuity.
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Zero-Leakage Role Masking:</strong>
                  <p className="text-slate-600 mt-1">
                    Citizen sessions cannot receive banking charges, loan amounts, or court docket numbers across the wire; fields are stripped at the API controller layer rather than simply hidden in CSS.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'uiux' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">7. UI/UX Guidelines & Government Design System</h3>
              <p className="text-slate-600 leading-relaxed">
                Follows Government of India Web Guidelines (GIGW) and India Stack design ethos:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 bg-white border border-slate-200 rounded text-center">
                  <div className="w-6 h-6 rounded bg-[#0B3D6E] mx-auto mb-1" />
                  <span className="font-semibold block">Navy Primary</span>
                  <span className="text-[10px] text-slate-500 font-mono">#0B3D6E</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded text-center">
                  <div className="w-6 h-6 rounded bg-[#F7F8FA] border mx-auto mb-1" />
                  <span className="font-semibold block">Canvas Light</span>
                  <span className="text-[10px] text-slate-500 font-mono">#F7F8FA</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded text-center">
                  <div className="w-6 h-6 rounded bg-emerald-600 mx-auto mb-1" />
                  <span className="font-semibold block">Clear Cadastre</span>
                  <span className="text-[10px] text-slate-500 font-mono">#059669</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded text-center">
                  <div className="w-6 h-6 rounded bg-rose-600 mx-auto mb-1" />
                  <span className="font-semibold block">Dispute Alert</span>
                  <span className="text-[10px] text-slate-500 font-mono">#E11D48</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'deployment' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">8. Deployment & Multi-State Scalability Roadmap</h3>
              <p className="text-slate-600 leading-relaxed">
                Honest prototype scope disclosure as required by SIH guidelines:
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div>
                  <strong className="text-slate-900">Current Prototype Scope:</strong>
                  <p className="text-slate-600 text-xs">
                    Demonstrates the core DPI paradigm on 26 real-world parcels across 5 metropolitan centers (Bengaluru, Hyderabad, Pune, Lucknow, Ahmedabad).
                  </p>
                </div>
                <div>
                  <strong className="text-slate-900">Production Scaling Roadmap:</strong>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs mt-1">
                    <li>Migrate in-memory spatial indexes to PostgreSQL / PostGIS cluster with spatial R-Tree indexing.</li>
                    <li>Deploy federated API connectors to integrate with existing state repositories (e.g. Karnataka Bhoomi, Telangana Dharani, Maharashtra Mahabhulekh).</li>
                    <li>Integrate e-Pramaan and DigiLocker for real Aadhaar-based cryptographic e-Signatures on conveyance instruments.</li>
                    <li>Incorporate automated ISRO Bhuvan satellite orthophoto tile layers.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Spec as Markdown (.md)</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0B3D6E] text-white font-semibold rounded-lg text-xs hover:bg-[#082a4d]"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};
