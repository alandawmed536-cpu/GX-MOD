import React from 'react';
import { X, Globe, Moon, Sun, Trash2, Info, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onClearAllSessions: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  theme,
  onToggleTheme,
  onClearAllSessions,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 relative space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.settings}</h2>
              <p className="text-xs text-slate-500">LumaAi Preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change Language Section */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{t.language} / Change Languages</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSelectLanguage('en')}
              className={`p-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                language === 'en'
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-sm">🇬🇧</span>
              <span>English</span>
            </button>

            <button
              onClick={() => onSelectLanguage('ckb')}
              className={`p-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                language === 'ckb'
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-sm">☀️</span>
              <span>کوردی (سۆرانی)</span>
            </button>

            <button
              onClick={() => onSelectLanguage('ar')}
              className={`p-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                language === 'ar'
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="text-sm">🌴</span>
              <span>العربية</span>
            </button>
          </div>
        </div>

        {/* Appearance / Theme */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>{t.theme}</span>
          </label>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-800">ChatGPT Dark Canvas Theme</span>
            <button
              onClick={onToggleTheme}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                theme === 'dark' ? 'bg-black text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {theme === 'dark' ? 'Pure Black' : 'Light'}
            </button>
          </div>
        </div>

        {/* About LumaAi Identity Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-black text-white space-y-2 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Info className="w-4 h-4" />
            <span>About LumaAi</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>LumaAi</strong> is an intelligent AI assistant developed by a <strong>Kurdish Developer</strong> (گەشەپێدەرێکی کورد). Designed for fast multi-turn responses, code engineering, and language translation.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Developed by Kurdish Developer • LumaAi Core</span>
          </div>
        </div>

        {/* Clear Data Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm(t.clearConfirm)) {
                onClearAllSessions();
                onClose();
              }
            }}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.clearAllChats}</span>
          </button>
        </div>

        {/* Close Modal Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-black text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
