import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../services/apiClient';
import { Bell, Check, X, ShieldAlert, FileText, Database, Sparkles } from 'lucide-react';

export interface SystemNotification {
  id: string;
  type: 'LEDGER_BLOCK' | 'REQUEST_STATUS' | 'TAMPER_ALERT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  roleTarget?: string;
}

export const NotificationBell: React.FC = () => {
  const { currentRole, sessionToken } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'init-1',
      type: 'SYSTEM',
      title: 'KSHETRA OS Initialized',
      message: 'Sovereign DPI cadastre ready. Connected to SHA-256 ledger.',
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tkn = sessionToken || apiClient.getToken();
    if (!tkn) return;

    // Connect to Server-Sent Events stream with query token
    const eventSource = new EventSource(`/api/events?token=${encodeURIComponent(tkn)}`);

    const handleEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'LEDGER_BLOCK') {
          setNotifications((prev) => [
            {
              id: `block-${payload.data?.index || payload.data?.blockIndex || Date.now()}`,
              type: 'LEDGER_BLOCK',
              title: `New Block #${payload.data?.index || payload.data?.blockIndex || '1'} Anchored`,
              message: `${payload.data?.action} recorded by ${payload.data?.actorRole || 'System'}.`,
              timestamp: payload.data?.timestamp || new Date().toISOString(),
              read: false
            },
            ...prev.slice(0, 19)
          ]);
        } else if (payload.type === 'REQUEST_STATUS') {
          setNotifications((prev) => [
            {
              id: `req-${payload.data?.id || Date.now()}`,
              type: 'REQUEST_STATUS',
              title: `Application #${payload.data?.id} Updated`,
              message: `Status moved to ${payload.data?.status}.`,
              timestamp: new Date().toISOString(),
              read: false
            },
            ...prev.slice(0, 19)
          ]);
        }
      } catch {
        // Ignore unparseable frames
      }
    };

    eventSource.onmessage = handleEvent;
    eventSource.addEventListener('LEDGER_BLOCK', handleEvent as EventListener);
    eventSource.addEventListener('REQUEST_STATUS', handleEvent as EventListener);
    eventSource.addEventListener('NOTIFICATION', handleEvent as EventListener);

    return () => {
      eventSource.close();
    };
  }, [sessionToken, currentRole]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
        aria-label="Notifications"
        title={t('notificationsTooltip')}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 text-slate-900 rounded-full font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0B3D6E]" />
              <span className="font-serif font-bold text-slate-900">{t('eventStreamTitle')}</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0B3D6E] font-mono text-[10px] font-bold">
                  {unreadCount} {t('newNotifications')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-[#0B3D6E] hover:underline cursor-pointer"
                >
                  {t('markAllRead')}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                {t('noNotifications')}
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 transition-colors ${
                    n.read ? 'bg-white opacity-80' : 'bg-blue-50/40 font-medium'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {n.type === 'LEDGER_BLOCK' ? (
                        <Database className="w-3.5 h-3.5 text-[#0B3D6E] shrink-0" />
                      ) : n.type === 'REQUEST_STATUS' ? (
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-900 text-xs">{n.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-5">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="pt-2 px-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={clearNotifications}
                className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {t('clearAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
