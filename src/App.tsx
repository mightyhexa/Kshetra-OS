import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { SplashLoader } from './components/SplashLoader';
import { MapSearchView } from './components/MapSearchView';
import { ParcelDetailPanel } from './components/ParcelDetailPanel';
import { CitizenServiceView } from './components/CitizenServiceView';
import { OfficerDashboard } from './components/OfficerDashboard';
import { AuditLedgerView } from './components/AuditLedgerView';
import { UserProfileModal } from './components/UserProfileModal';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { TechnicalDocumentModal } from './components/TechnicalDocumentModal';
import { FeaturesRoadmapModal } from './components/FeaturesRoadmapModal';
import { DigitalCertificateModal } from './components/DigitalCertificateModal';
import { GovernmentDossierModal } from './components/GovernmentDossierModal';
import { CadastralSubdivisionModal } from './components/CadastralSubdivisionModal';
import { TemporalChangeDetectionModal } from './components/TemporalChangeDetectionModal';
import { TitleClarityScoreModal } from './components/TitleClarityScoreModal';
import { BhashiniVoiceAssistantModal } from './components/BhashiniVoiceAssistantModal';
import { LoginModal } from './components/LoginModal';
import { MOCK_PARCELS } from './data/mockParcels';
import { Parcel } from './types';

function MainAppContent() {
  const { currentRole, isAuthenticated, logout } = useAuth();

  // Animated Splash Boot Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Tab & Selection State
  const [activeTab, setActiveTab] = useState<'map' | 'citizen' | 'officer' | 'audit'>('map');
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

  // Action: Initiate service request from parcel panel
  const handleInitiateServiceRequest = (ulpin: string) => {
    setPreselectedUlpinForService(ulpin);
    setSelectedParcel(null);
    setActiveTab('citizen');
  };

  // Action: View parcel on map from dashboard or citizen tracker
  const handleViewParcelOnMap = (ulpin: string) => {
    const found = MOCK_PARCELS.find(p => p.ulpin === ulpin);
    if (found) {
      setSelectedParcel(found);
      setActiveTab('map');
    }
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

  // If not authenticated, show the official government entry Login Page!
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => setActiveTab('map')}
        onOpenTechDoc={() => setIsTechDocOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-800 flex flex-col antialiased selection:bg-blue-100 selection:text-[#0B3D6E]">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenApiInspector={() => setIsApiInspectorOpen(true)}
        onOpenTechDoc={() => setIsTechDocOpen(true)}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
        onLogout={logout}
      />

      {/* Main View Body */}
      <main id="main-content" className="flex-1 relative overflow-x-hidden">
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
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
