import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Stage 5A Motion & Polish: Comprehensive Animation Suite', () => {
  const cssPath = path.resolve(__dirname, '../src/index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  it('1. Tab Transition Animation: verifies CSS keyframes and App.tsx application', () => {
    expect(cssContent).toContain('@keyframes tabFadeRise');
    expect(cssContent).toContain('.tab-transition');
    const appPath = path.resolve(__dirname, '../src/App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');
    expect(appContent).toContain('tab-transition');
  });

  it('2. KPI Count-Up Animation: verifies CSS keyframes and KpiCard.tsx application', () => {
    expect(cssContent).toContain('@keyframes countUpAnimation');
    expect(cssContent).toContain('.kpi-count-up');
    const kpiPath = path.resolve(__dirname, '../src/components/ui/KpiCard.tsx');
    const kpiContent = fs.readFileSync(kpiPath, 'utf8');
    expect(kpiContent).toContain('kpi-count-up');
  });

  it('3. List Card Stagger Animation: verifies CSS keyframes and CitizenServiceView.tsx application', () => {
    expect(cssContent).toContain('@keyframes cardStagger');
    expect(cssContent).toContain('.card-stagger-item');
    const citizenPath = path.resolve(__dirname, '../src/components/CitizenServiceView.tsx');
    const citizenContent = fs.readFileSync(citizenPath, 'utf8');
    expect(citizenContent).toContain('card-stagger-item');
    expect(citizenContent).toContain('animationDelay');
  });

  it('4. Badge Pulse Animation: verifies CSS keyframes and Chip.tsx application', () => {
    expect(cssContent).toContain('@keyframes pulseOnce');
    expect(cssContent).toContain('.badge-pulse-once');
    const chipPath = path.resolve(__dirname, '../src/components/ui/Chip.tsx');
    const chipContent = fs.readFileSync(chipPath, 'utf8');
    expect(chipContent).toContain('badge-pulse-once');
  });

  it('5. Parcel Outline Draw Animation: verifies CSS keyframes and index.css definition', () => {
    expect(cssContent).toContain('@keyframes strokeDashDraw');
    expect(cssContent).toContain('.parcel-outline-draw');
  });

  it('6. Panel Slide-In Animation: verifies CSS keyframes and ParcelDetailPanel.tsx application', () => {
    expect(cssContent).toContain('@keyframes slideInRight');
    expect(cssContent).toContain('.side-panel-slide-in');
    const panelPath = path.resolve(__dirname, '../src/components/ParcelDetailPanel.tsx');
    const panelContent = fs.readFileSync(panelPath, 'utf8');
    expect(panelContent).toContain('side-panel-slide-in');
  });

  it('7. Ledger Verify Sweep Animation: verifies CSS keyframes and AuditLedgerView.tsx application', () => {
    expect(cssContent).toContain('@keyframes verifySweepAnimation');
    expect(cssContent).toContain('.ledger-verify-sweep');
    const auditPath = path.resolve(__dirname, '../src/components/AuditLedgerView.tsx');
    const auditContent = fs.readFileSync(auditPath, 'utf8');
    expect(auditContent).toContain('ledger-verify-sweep');
  });

  it('8. Tamper Shake Animation: verifies CSS keyframes and AuditLedgerView.tsx application', () => {
    expect(cssContent).toContain('@keyframes shakeOnce');
    expect(cssContent).toContain('.block-shake-once');
    const auditPath = path.resolve(__dirname, '../src/components/AuditLedgerView.tsx');
    const auditContent = fs.readFileSync(auditPath, 'utf8');
    expect(auditContent).toContain('block-shake-once');
  });

  it('9. Reset To Green Transition: verifies status banner styling in AuditLedgerView.tsx', () => {
    const auditPath = path.resolve(__dirname, '../src/components/AuditLedgerView.tsx');
    const auditContent = fs.readFileSync(auditPath, 'utf8');
    expect(auditContent).toContain('bg-emerald-50 border-emerald-300');
    expect(auditContent).toContain('bg-rose-50 border-rose-300');
  });

  it('10. Chain-Strip Link Entry Animation: verifies CSS keyframes and AuditLedgerView.tsx application', () => {
    expect(cssContent).toContain('@keyframes chainLinkNewAnimation');
    expect(cssContent).toContain('.chain-link-new');
    const auditPath = path.resolve(__dirname, '../src/components/AuditLedgerView.tsx');
    const auditContent = fs.readFileSync(auditPath, 'utf8');
    expect(auditContent).toContain('chain-link-new');
  });

  it('11. Interactive Hover/Press States: verifies CSS definition and Button.tsx application', () => {
    expect(cssContent).toContain('.interactive-press');
    expect(cssContent).toContain('transform: scale(0.98)');
    const buttonPath = path.resolve(__dirname, '../src/components/ui/Button.tsx');
    const buttonContent = fs.readFileSync(buttonPath, 'utf8');
    expect(buttonContent).toContain('interactive-press');
    expect(buttonContent).toContain('focus-visible:ring-2');
  });

  it('12. Dev Parameter ?slowmo=1: verifies --motion-scale variable support', () => {
    expect(cssContent).toContain('--motion-scale: 1');
    expect(cssContent).toContain('var(--motion-scale)');
    const appPath = path.resolve(__dirname, '../src/App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');
    expect(appContent).toContain('slowmo');
    expect(appContent).toContain('--motion-scale');
  });

  it('13. Prefers-Reduced-Motion Override: verifies media query disables all 11 animation classes', () => {
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    const mediaQueryBlock = cssContent.slice(cssContent.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(mediaQueryBlock).toContain('.tab-transition');
    expect(mediaQueryBlock).toContain('.badge-pulse-once');
    expect(mediaQueryBlock).toContain('.block-shake-once');
    expect(mediaQueryBlock).toContain('.parcel-outline-draw');
    expect(mediaQueryBlock).toContain('.side-panel-slide-in');
    expect(mediaQueryBlock).toContain('.card-stagger-item');
    expect(mediaQueryBlock).toContain('.kpi-count-up');
    expect(mediaQueryBlock).toContain('.ledger-verify-sweep');
    expect(mediaQueryBlock).toContain('.chain-link-new');
    expect(mediaQueryBlock).toContain('.interactive-press');
    expect(mediaQueryBlock).toContain('animation: none !important');
    expect(mediaQueryBlock).toContain('transition: none !important');
  });
});
