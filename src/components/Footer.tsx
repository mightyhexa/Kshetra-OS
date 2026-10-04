import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Shield, Eye, HelpCircle, Mail, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [modalType, setModalType] = useState<'accessibility' | 'privacy' | 'terms' | 'contact' | null>(null);

  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-auto">
      {/* Tricolour Accent Line */}
      <div className="tricolour-ribbon" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-xs text-[#64748B]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-serif font-semibold text-sm text-[#0B3D6E]">
              {t('appTitle')} — {t('appSubtitle')}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t('footerDisclaimer')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => setModalType('accessibility')}
              className="text-[#0B3D6E] hover:underline font-medium cursor-pointer"
            >
              {t('footerAccessibility')}
            </button>
            <span>·</span>
            <button
              onClick={() => setModalType('privacy')}
              className="text-[#0B3D6E] hover:underline font-medium cursor-pointer"
            >
              {t('footerPrivacy')}
            </button>
            <span>·</span>
            <button
              onClick={() => setModalType('terms')}
              className="text-[#0B3D6E] hover:underline font-medium cursor-pointer"
            >
              {t('footerTerms')}
            </button>
            <span>·</span>
            <button
              onClick={() => setModalType('contact')}
              className="text-[#0B3D6E] hover:underline font-medium cursor-pointer"
            >
              {t('footerContact')}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 pt-4 border-t border-[#F1F5F9] text-[11px] text-slate-400">
          <span>{t('footerGovernmentHackathonNotice')}</span>
          <span className="font-mono">{t('footerBuildVersion')}</span>
        </div>
      </div>

      {/* Accessibility Modal */}
      <Modal
        isOpen={modalType === 'accessibility'}
        onClose={() => setModalType(null)}
        title={t('footerAccessibility')}
        subtitle={t('footerAccessibilitySubtitle')}
      >
        <div className="space-y-4 text-sm leading-relaxed text-[#334155]">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-[#0B3D6E]">
            <strong>{t('footerCommitmentTitle')}</strong> {t('footerCommitmentDesc')}
          </div>
          <h4 className="font-semibold text-sm text-[#0F172A]">{t('footerConformanceMeasures')}</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>{t('footerTypographyHierarchy')}</strong> {t('footerTypographyDesc')}</li>
            <li><strong>{t('footerFontScaling')}</strong> {t('footerFontScalingDesc')}</li>
            <li><strong>{t('footerHighContrast')}</strong> {t('footerHighContrastDesc')}</li>
            <li><strong>{t('footerDualCodedSignals')}</strong> {t('footerDualCodedDesc')}</li>
            <li><strong>{t('footerScreenReaderLive')}</strong> {t('footerScreenReaderDesc')}</li>
          </ul>
          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setModalType(null)}>{t('closeBtn')}</Button>
          </div>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={modalType === 'privacy'}
        onClose={() => setModalType(null)}
        title={t('footerPrivacy')}
        subtitle={t('footerPrivacySubtitle')}
      >
        <div className="space-y-4 text-sm leading-relaxed text-[#334155]">
          <p className="text-xs">
            <strong>{t('footerSyntheticDataTitle')}</strong> {t('footerSyntheticDataDesc')}
          </p>
          <h4 className="font-semibold text-sm text-[#0F172A]">{t('footerPrivacyGuarantees')}</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li>{t('footerPrivacyItem1')}</li>
            <li>{t('footerPrivacyItem2')}</li>
            <li>{t('footerPrivacyItem3')}</li>
          </ul>
          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setModalType(null)}>{t('actionAcknowledge')}</Button>
          </div>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal
        isOpen={modalType === 'terms'}
        onClose={() => setModalType(null)}
        title={t('footerTerms')}
        subtitle={t('footerTermsSubtitle')}
      >
        <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
          <p>{t('footerTermsDesc1')}</p>
          <p>{t('footerTermsDesc2')}</p>
          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setModalType(null)}>{t('closeBtn')}</Button>
          </div>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal
        isOpen={modalType === 'contact'}
        onClose={() => setModalType(null)}
        title={t('footerContact')}
        subtitle={t('footerContactSubtitle')}
      >
        <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="font-semibold text-slate-900">Project KSHETRA OS</p>
            <p className="text-slate-600">{t('footerDisclaimer')}</p>
            <p className="text-slate-600 mt-1">{t('footerLeadContact')} <code>mdfahadali.in@gmail.com</code></p>
          </div>
          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={() => setModalType(null)}>{t('closeBtn')}</Button>
          </div>
        </div>
      </Modal>
    </footer>
  );
};
