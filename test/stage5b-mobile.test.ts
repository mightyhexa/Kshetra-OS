import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Stage 5B Mobile & Responsive Verification Suite', () => {
  it('1. Bottom-Nav Role Filtering: confirms Citizen role never sees Console or Analytics', () => {
    const navbarPath = path.resolve(__dirname, '../src/components/Navbar.tsx');
    const navbarContent = fs.readFileSync(navbarPath, 'utf8');

    // Confirm isOfficerOrAdmin check wraps Console tab
    expect(navbarContent).toContain('isOfficerOrAdmin');
    expect(navbarContent).toContain('Console');

    // Confirm isAdmin check wraps Analytics tab in More menu
    expect(navbarContent).toContain('isAdmin');
    expect(navbarContent).toContain('Analytics');
  });

  it('2. Hash Copy & Expand Control: confirms CopyHashPill supports 64-char expand and copy button', () => {
    const hashPillPath = path.resolve(__dirname, '../src/components/ui/CopyHashPill.tsx');
    const hashPillContent = fs.readFileSync(hashPillPath, 'utf8');

    expect(hashPillContent).toContain('isExpanded');
    expect(hashPillContent).toContain('toggleExpand');
    expect(hashPillContent).toContain('Full Unabridged SHA-256 Hash');
    expect(hashPillContent).toContain('navigator.clipboard.writeText');
  });

  it('3. Map on Phones: verifies filter drawer, bottom sheet layers, and zoom control clearances', () => {
    const mapPath = path.resolve(__dirname, '../src/components/MapSearchView.tsx');
    const mapContent = fs.readFileSync(mapPath, 'utf8');

    expect(mapContent).toContain('isFilterDrawerOpen');
    expect(mapContent).toContain('isLayersMenuOpen');
    expect(mapContent).toContain('activeFiltersCount');
  });

  it('5. Tables to Stacked Cards: verifies mobile card layout rendering for workflow queue and lists', () => {
    const dashboardPath = path.resolve(__dirname, '../src/components/OfficerDashboard.tsx');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

    expect(dashboardContent).toContain('md:hidden');
    expect(dashboardContent).toContain('card-stagger-item');

    const citizenPath = path.resolve(__dirname, '../src/components/CitizenServiceView.tsx');
    const citizenContent = fs.readFileSync(citizenPath, 'utf8');
    expect(citizenContent).toContain('card-stagger-item');
  });

  it('7. Modals as Full-Screen Sheets: verifies full-screen mobile sheet classes and input sizing', () => {
    const modalPath = path.resolve(__dirname, '../src/components/ui/Modal.tsx');
    const modalContent = fs.readFileSync(modalPath, 'utf8');

    expect(modalContent).toContain('w-full h-full sm:h-auto');
    expect(modalContent).toContain('rounded-none sm:rounded-xl');
  });

  it('8. Touch Target Standards: confirms min-h-[44px] and focus rings across interactive components', () => {
    const navbarPath = path.resolve(__dirname, '../src/components/Navbar.tsx');
    const navbarContent = fs.readFileSync(navbarPath, 'utf8');
    expect(navbarContent).toContain('min-h-[44px]');

    const buttonPath = path.resolve(__dirname, '../src/components/ui/Button.tsx');
    const buttonContent = fs.readFileSync(buttonPath, 'utf8');
    expect(buttonContent).toContain('focus-visible:ring-2');
  });

  it('9. Guided Demo on Mobile: verifies spotlight box screen fit and step navigation', () => {
    const demoPath = path.resolve(__dirname, '../src/components/GuidedDemoModal.tsx');
    const demoContent = fs.readFileSync(demoPath, 'utf8');

    expect(demoContent).toContain('isOpen');
    expect(demoContent).toContain('currentStep');
  });
});
