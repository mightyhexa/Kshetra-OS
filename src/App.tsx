import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { SplashLoader } from './components/SplashLoader';
import { ParcelDetailPanel } from './components/ParcelDetailPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { apiClient } from './services/apiClient';
import { Parcel } from './types';
import { ChevronRight, Home } from 'lucide-react';

// Lazy Loaded Views and Modals for Fast Initial Bundle (< 500kB)
const MapSearchView = lazy(() => import('./components/MapSearchView').then(m => ({ default: m.MapSearchView })));
const CitizenServiceView = lazy(() => import('./components/CitizenServiceView').then(m => ({ default: m.CitizenServiceView })));
const OfficerDashboard = lazy(() => import('./components/OfficerDashboard').then(m => ({ default: m.OfficerDashboard })));
const AuditLedgerView = lazy(() => import('./components/AuditLedgerView').then(m => ({ default: m.AuditLedgerView })));
const DocumentVerificationView = lazy(() => import('./components/DocumentVerificationView').then(m => ({ default: m.DocumentVerificationView })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView })));

const UserProfileModal = lazy(() => import('./components/UserProfileModal').then(m => ({ default: m.UserProfileModal })));
const ApiInspectorModal = lazy(() => import('./components/ApiInspectorModal').then(m => ({ default: m.ApiInspectorModal })));
const TechnicalDocumentModal = lazy(() => import('./components/TechnicalDocumentModal').then(m => ({ default: m.TechnicalDocumentModal })));
const FeaturesRoadmapModal = lazy(() => import('./components/FeaturesRoadmapModal').then(m => ({ default: m.FeaturesRoadmapModal })));
const DigitalCertificateModal = lazy(() => import('./components/DigitalCertificateModal').then(m => ({ default: m.DigitalCertificateModal })));
const GovernmentDossierModal = lazy(() => import('./components/GovernmentDossierModal').then(m => ({ default: m.GovernmentDossierModal })));
const GuidedDemoModal = lazy(() => import('./components/GuidedDemoModal').then(m => ({ default: m.GuidedDemoModal })));
const CadastralSubdivisionModal = lazy(() => import('./components/CadastralSubdivisionModal').then(m => ({ default: m.CadastralSubdivisionModal })));
const TemporalChangeDetectionModal = lazy(() => import('./components/TemporalChangeDetectionModal').then(m => ({ default: m.TemporalChangeDetectionModal })));
const TitleClarityScoreModal = lazy(() => import('./components/TitleClarityScoreModal').then(m => ({ default: m.TitleClarityScoreModal })));
const BhashiniVoiceAssistantModal = lazy(() => import('./components/BhashiniVoiceAssistantModal').then(m => ({ default: m.BhashiniVoiceAssistantModal })));
const LoginModal = lazy(() => import('./components/LoginModal').then(m => ({ default: m.LoginModal })));

function MainAppContent() {
  const { currentRole, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  // Handle ?slowmo=1 dev param
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('slowmo') === '1') {
      document.documentElement.style.setProperty('--motion-scale', '4');
    }
  }, []);

  // Animated Splash Boot Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Tab & Selection State
  const [activeTab, setActiveTab] = useState<'map' | 'citizen' | 'officer' | 'audit' | 'verify' | 'analytics'>('map');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [preselectedUlpinForService, setPreselectedUlpinForService] = useState<string | undefined>(undefined);

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isApiInspectorOpen, setIsApiInspectorOpen] = useState(false);
  const [isTechDocOpen, setIsTechDocOpen] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [certificateParcel, setCertificateParcel] = useState<Parcel | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierParcel, setDossierParcel] = useState<Parcel | null>(null);
  const [isSubdivisionOpen, setIsSubdivisionOpen] = useState(false);
  const [isChangeDetectionOpen, setIsChangeDetectionOpen] = useState(false);
  const [isTitleScoreOpen, setIsTitleScoreOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [activeToolParcel, setActiveToolParcel] = useState<Parcel | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGuidedDemoOpen, setIsGuidedDemoOpen] = useState(false);

  // Role Gate Enforcement: Never allow unauthorized tabs when role switches or tours exit
  useEffect(() => {
    if (activeTab === 'analytics' && currentRole !== 'policy_admin') {
      setActiveTab('map');
    } else if (activeTab === 'officer' && currentRole === 'citizen') {
      setActiveTab('map');
    }
  }, [currentRole, activeTab]);

  // Action: Initiate service request from parcel panel
  const handleInitiateServiceRequest = (ulpin: string) => {
    setPreselectedUlpinForService(ulpin);
    setSelectedParcel(null);
    setActiveTab('citizen');
  };

  // Action: View parcel on map from dashboard or citizen tracker
  const handleViewParcelOnMap = async (ulpin: string) => {
    try {
      const found = await apiClient.getParcel(ulpin);
      if (found) {
        setSelectedParcel(found);
      }
    } catch {
      // Ignore if not found
    }
    setActiveTab('map');
  };

  // Action handlers for advanced tools
  const handleOpenCertificate = (p: Parcel) => {
    setCertificateParcel(p);
    setIsCertificateOpen(true);
  };

  const handleOpenDossier = (p: Parcel) => {
    setDossierParcel(p);
    setIsDossierOpen(true);
  };

  const handleOpenSubdivision = (p: Parcel) => {
    setActiveToolParcel(p);
    setIsSubdivisionOpen(true);
  };

  const handleOpenChangeDetection = (p: Parcel) => {
    setActiveToolParcel(p);
    setIsChangeDetectionOpen(true);
  };

  const handleOpenTitleScore = (p: Parcel) => {
    setActiveToolParcel(p);
    setIsTitleScoreOpen(true);
  };

  const handleOpenVoiceAssistant = (p: Parcel) => {
    setActiveToolParcel(p);
    setIsVoiceAssistantOpen(true);
  };

  // If splash loader is running, display professional animated boot sequence!
  if (showSplash) {
    return <SplashLoader onComplete={() => setShowSplash(false)} />;
  }

  // If not authenticated, show official government entry Login Page!
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => setActiveTab('map')}
        onOpenTechDoc={() => setIsTechDocOpen(true)}
      />
    );
  }

  const tabLabels: Record<string, string> = {
    map: t('navCadastre'),
    citizen: t('navCitizenServices'),
    officer: t('navOfficerConsole'),
    audit: t('navAuditLedger'),
    verify: t('navVerifyDoc'),
    analytics: t('navAnalytics')
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] survey-grid-canvas text-[#0F172A] flex flex-col antialiased selection:bg-blue-100 selection:text-[#0B3D6E]">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenApiInspector={() => setIsApiInspectorOpen(true)}
        onOpenTechDoc={() => setIsTechDocOpen(true)}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
        onStartGuidedDemo={() => setIsGuidedDemoOpen(true)}
        onLogout={logout}
      />

      {/* Accessible Breadcrumbs Bar on inner pages */}
      {activeTab !== 'map' && (
        <nav aria-label="Breadcrumb" className="bg-white/80 border-b border-[#E2E8F0] px-4 sm:px-6 py-2 text-xs text-[#64748B]">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('map')}
              className="inline-flex items-center gap-1 hover:text-[#0B3D6E] cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#0B3D6E]" />
              <span>National Cadastre</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-[#0B3D6E]">{tabLabels[activeTab]}</span>
          </div>
        </nav>
      )}

      {/* Main View Body */}
      <main id="main-content" className="flex-1 relative overflow-hidden flex flex-col min-h-0">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-mono"><div className="w-8 h-8 rounded-full border-4 border-[#0B3D6E] border-t-transparent animate-spin mx-auto mb-2" />Loading KSHETRA Module...</div>}>
          <div key={activeTab} className="tab-transition flex-1 flex flex-col min-h-0">
            <ErrorBoundary key={activeTab}>
              {activeTab === 'map' && (
                <MapSearchView
                  selectedParcel={selectedParcel}
                  onSelectParcel={setSelectedParcel}
                />
              )}

              {activeTab === 'citizen' && (
                <CitizenServiceView
                  onViewParcelOnMap={handleViewParcelOnMap}
                  preselectedUlpin={preselectedUlpinForService}
                  onOpenDossier={handleOpenDossier}
                />
              )}

              {activeTab === 'officer' && (
                <OfficerDashboard
                  onViewParcelOnMap={handleViewParcelOnMap}
                  onOpenDossier={handleOpenDossier}
                />
              )}

              {activeTab === 'audit' && (
                <AuditLedgerView />
              )}

              {activeTab === 'verify' && (
                <DocumentVerificationView />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView />
              )}
            </ErrorBoundary>
          </div>
        </Suspense>

        {/* Slide-over Parcel Detail Panel */}
        <ParcelDetailPanel
          parcel={selectedParcel}
          userRole={currentRole}
          onClose={() => setSelectedParcel(null)}
          onInitiateServiceRequest={handleInitiateServiceRequest}
          onOpenApiInspector={() => setIsApiInspectorOpen(true)}
          onGenerateCertificate={handleOpenCertificate}
          onOpenSubdivision={handleOpenSubdivision}
          onOpenChangeDetection={handleOpenChangeDetection}
          onOpenTitleScore={handleOpenTitleScore}
          onOpenVoiceAssistant={handleOpenVoiceAssistant}
          onOpenDossier={handleOpenDossier}
        />
      </main>

      {/* Accessible Footer on inner content pages */}
      {activeTab !== 'map' && <Footer />}

      {/* Modals & Dialogs */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <ApiInspectorModal
        isOpen={isApiInspectorOpen}
        onClose={() => setIsApiInspectorOpen(false)}
        initialUlpin={selectedParcel?.ulpin}
      />

      <TechnicalDocumentModal
        isOpen={isTechDocOpen}
        onClose={() => setIsTechDocOpen(false)}
      />

      <FeaturesRoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
      />

      <GovernmentDossierModal
        parcel={dossierParcel || selectedParcel}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        userRole={currentRole}
      />

      <DigitalCertificateModal
        parcel={certificateParcel || selectedParcel}
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
      />

      <CadastralSubdivisionModal
        parcel={activeToolParcel || selectedParcel}
        isOpen={isSubdivisionOpen}
        onClose={() => setIsSubdivisionOpen(false)}
      />

      <TemporalChangeDetectionModal
        parcel={activeToolParcel || selectedParcel}
        isOpen={isChangeDetectionOpen}
        onClose={() => setIsChangeDetectionOpen(false)}
      />

      <TitleClarityScoreModal
        parcel={activeToolParcel || selectedParcel}
        isOpen={isTitleScoreOpen}
        onClose={() => setIsTitleScoreOpen(false)}
      />

      <BhashiniVoiceAssistantModal
        parcel={activeToolParcel || selectedParcel}
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <GuidedDemoModal
        isOpen={isGuidedDemoOpen}
        onClose={() => setIsGuidedDemoOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
