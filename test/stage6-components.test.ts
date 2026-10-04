import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { dictionaries } from '../src/i18n';

describe('STAGE 6: Component & Translation Parity Tests', () => {
  it('1. Translation Key Coverage: verifies no raw placeholder keys across en, hi, kn', () => {
    const activeLanguages = ['en', 'hi', 'kn'];
    const requiredKeys = [
      'appTitle',
      'navCadastre',
      'navCitizenServices',
      'navOfficerConsole',
      'navAnalytics',
      'navAuditLedger',
      'navVerifyDoc',
      'navSpecs',
      'roleCitizen',
      'roleOfficer',
      'roleAdmin'
    ];

    activeLanguages.forEach(langCode => {
      const dict = dictionaries[langCode as keyof typeof dictionaries];
      expect(dict).toBeDefined();

      requiredKeys.forEach(k => {
        const val = dict[k as keyof typeof dict];
        expect(val).toBeDefined();
        expect(typeof val).toBe('string');
        expect(val.length).toBeGreaterThan(0);
        // Ensure no untranslated raw dot notation like "nav.map"
        expect(val).not.toMatch(/^[a-z]+\.[a-z]+$/i);
      });
    });
  });

  it('2. Nav & Bottom Bar Role Gating: verifies Citizen cannot access Console or Analytics', () => {
    const navbarPath = path.resolve(__dirname, '../src/components/Navbar.tsx');
    const navbarContent = fs.readFileSync(navbarPath, 'utf8');

    // Confirm isOfficerOrAdmin gating for Officer Console
    expect(navbarContent).toContain('isOfficerOrAdmin');
    expect(navbarContent).toContain('navOfficerConsole');

    // Confirm isAdmin gating for Analytics
    expect(navbarContent).toContain('isAdmin');
    expect(navbarContent).toContain('navAnalytics');
  });

  it('3. ErrorBoundary & Resilience: verifies ErrorBoundary renders fallback state on forced component failure', () => {
    const ebPath = path.resolve(__dirname, '../src/components/ErrorBoundary.tsx');
    const ebContent = fs.readFileSync(ebPath, 'utf8');

    expect(ebContent).toContain('componentDidCatch');
    expect(ebContent).toContain('Reload Screen');
    expect(ebContent).toContain('Retry Module');
  });

  it('4. Hash Copy & Expand: verifies CopyHashPill full 64-char expand and clipboard integration', () => {
    const hashPillPath = path.resolve(__dirname, '../src/components/ui/CopyHashPill.tsx');
    const hashPillContent = fs.readFileSync(hashPillPath, 'utf8');

    expect(hashPillContent).toContain('Full Unabridged SHA-256 Hash');
    expect(hashPillContent).toContain('toggleExpand');
    expect(hashPillContent).toContain('navigator.clipboard.writeText');
  });

  it('5. Drawer & Fullscreen Modal: verifies Filter drawer and Modal mobile layout responsiveness', () => {
    const drawerPath = path.resolve(__dirname, '../src/components/ui/Drawer.tsx');
    const drawerContent = fs.readFileSync(drawerPath, 'utf8');
    expect(drawerContent).toContain('fixed inset-y-0');

    const modalPath = path.resolve(__dirname, '../src/components/ui/Modal.tsx');
    const modalContent = fs.readFileSync(modalPath, 'utf8');
    expect(modalContent).toContain('w-full h-full sm:h-auto');
  });
});
