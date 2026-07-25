import React from 'react';
import { 
  Plus, 
  Settings, 
  Globe, 
  Download, 
  Sparkles,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { ChatSession, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PERSONAS } from '../data/personas';
import { exportSingleSessionMarkdown } from '../utils/storage';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  currentSession: ChatSession | null;
  onNewChat: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  useSearch: boolean;
  setUseSearch: (use: boolean | ((prev: boolean) => boolean)) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  currentSession,
  onNewChat,
  language,
  setLanguage,
  useSearch,
  setUseSearch,
  onOpenSettings
}) => {
  const t = TRANSLATIONS[language];
  const activePersona = PERSONAS.find(p => p.id === (currentSession?.personaId || 'luma-ai')) || PERSONAS[0];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-3 md:px-5 py-3 bg-white text-slate-900 border-b border-slate-200 shadow-sm transition-colors">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          title={t.chatHistory}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-slate-900 line-clamp-1 tracking-tight">
              {currentSession?.title || 'LumaAi'}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LumaAi Core</span>
              <span className="hidden sm:inline-block text-slate-300">•</span>
              <span className="hidden sm:flex items-center gap-0.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                {t.saved}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">{t.newChat}</span>
        </button>

        {/* Export Markdown */}
        {currentSession && currentSession.messages.length > 0 && (
          <button
            onClick={() => exportSingleSessionMarkdown(currentSession)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            title={t.exportChat}
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Quick Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
          title={t.settings}
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs uppercase font-extrabold">{language}</span>
        </button>
      </div>
    </header>
  );
};
