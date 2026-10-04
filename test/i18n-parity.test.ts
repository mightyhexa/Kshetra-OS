import { describe, it, expect } from 'vitest';
import { en } from '../src/i18n/en';
import { hi } from '../src/i18n/hi';
import { kn } from '../src/i18n/kn';

describe('STAGE 3: i18n Dictionary Parity & Accessibility Validation', () => {
  it('enforces exact 1:1 key parity between English, Hindi, and Kannada dictionaries', () => {
    const enKeys = Object.keys(en).sort();
    const hiKeys = Object.keys(hi).sort();
    const knKeys = Object.keys(kn).sort();

    expect(enKeys.length).toBeGreaterThan(50);
    expect(hiKeys).toEqual(enKeys);
    expect(knKeys).toEqual(enKeys);

    // Verify no empty string translations exist
    for (const key of enKeys) {
      expect((en as any)[key].trim().length).toBeGreaterThan(0);
      expect((hi as any)[key].trim().length).toBeGreaterThan(0);
      expect((kn as any)[key].trim().length).toBeGreaterThan(0);
    }
  });

  it('contains translations for all 9 automated risk rules across all 3 languages', () => {
    const rulePrefixes = [
      'ruleR1',
      'ruleR2Overlap',
      'ruleR2Tolerance',
      'ruleR3EcoBuffer',
      'ruleR4ZoningMismatch',
      'ruleR5Far',
      'ruleR6DuplicateSale',
      'ruleR7Lien',
      'ruleR8Tax',
      'ruleR9Lineage'
    ];

    for (const prefix of rulePrefixes) {
      expect((en as any)[`${prefix}Title`]).toBeDefined();
      expect((en as any)[`${prefix}Desc`]).toBeDefined();
      expect((hi as any)[`${prefix}Title`]).toBeDefined();
      expect((hi as any)[`${prefix}Desc`]).toBeDefined();
      expect((kn as any)[`${prefix}Title`]).toBeDefined();
      expect((kn as any)[`${prefix}Desc`]).toBeDefined();
    }
  });

  it('validates prototype release version tag and WCAG accessibility statements', () => {
    expect(en.footerBuildVersion).toContain('v0.3.0-prototype');
    expect(en.footerAccessibility.toLowerCase()).toContain('wcag 2.1 aa');
    expect(hi.footerBuildVersion).toContain('v0.3.0-prototype');
    expect(kn.footerBuildVersion).toContain('v0.3.0-prototype');
  });
});
