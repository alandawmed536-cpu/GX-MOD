import React, { useState, useRef } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Pin, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Search, 
  Download, 
  Upload, 
  ShieldCheck, 
  Settings,
  Code2,
  Languages,
  GraduationCap
} from 'lucide-react';
import { ChatSession, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PERSONAS } from '../data/personas';
import { exportBackupData } from '../utils/storage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAllSessions: () => void;
  onImportBackup: (importedSessions: ChatSession[]) => void;
  activePersonaId: string;
  onChangePersona: (personaId: string) => void;
  language: Language;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onTogglePinSession,
  onRenameSession,
  onClearAllSessions,
  onImportBackup,
  activePersonaId,
  onChangePersona,
  language,
  onOpenSettings
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedSessions = filteredSessions.filter(s => s.isPinned);
  const recentSessions = filteredSessions.filter(s => !s.isPinned);

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
        } else {
          alert('Invalid backup file format');
        }
      } catch (err) {
        alert('Failed to read backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2': return <Code2 className="w-4 h-4" />;
      case 'Languages': return <Languages className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Drawer Container - Solid White High Contrast Menu */}
      <aside
        className={`fixed lg:static top-0 bottom-0 ${language === 'ckb' || language === 'ar' ? 'right-0' : 'left-0'} z-40 w-80 bg-white text-slate-900 flex flex-col h-full border-r border-slate-200 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : (language === 'ckb' || language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">{t.appName}</h2>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Kurdish Developer • LumaAi</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-black hover:bg-slate-800 text-white font-extrabold text-xs shadow-lg transition-all transform active:scale-98"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{t.newChat}</span>
          </button>
        </div>

        {/* Settings button in Menu */}
        <div className="px-3 pb-2">
          <button
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-600" />
              <span>{t.settings} / {t.changeLanguage}</span>
            </div>
            <span className="text-[10px] uppercase bg-white px-2 py-0.5 rounded border font-bold text-slate-600">{language}</span>
          </button>
        </div>

        {/* LumaAi Personas Mode Selection */}
        <div className="px-3 pb-2">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
            {t.personas}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {PERSONAS.map((p) => {
              const active = p.id === activePersonaId;
              return (
                <button
                  key={p.id}
                  onClick={() => onChangePersona(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className={`p-1 rounded-lg ${active ? 'bg-slate-800 text-emerald-400' : 'bg-slate-200 text-slate-700'}`}>
                    {getPersonaIcon(p.icon)}
                  </span>
                  <span className="truncate">{language === 'ckb' ? p.nameKurdish : p.nameEnglish}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search input for history */}
        <div className="px-3 py-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchHistory}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-black font-sans"
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{t.noChatsFound}</p>
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinnedSessions.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider px-2 mb-1 flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    <span>{t.pinned}</span>
                  </div>
                  <div className="space-y-1">
                    {pinnedSessions.map(session => renderSessionItem(session))}
                  </div>
                </div>
              )}

              {/* Recent Section */}
              {recentSessions.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    {t.recent}
                  </div>
                  <div className="space-y-1">
                    {recentSessions.map(session => renderSessionItem(session))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => exportBackupData(sessions)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
              title={t.exportAllBackup}
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span className="truncate">{t.exportAllBackup}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
              title={t.importBackup}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate">{t.importBackup}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>

          {sessions.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold border border-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAllChats}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">{t.clearAllChats}</h3>
            <p className="text-xs text-slate-500">{t.clearConfirm}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                {t.close}
              </button>
              <button
                onClick={() => {
                  onClearAllSessions();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  function renderSessionItem(session: ChatSession) {
    const isSelected = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => {
          onSelectSession(session.id);
          if (window.innerWidth < 1024) onClose();
        }}
        className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
          isSelected
            ? 'bg-black text-white font-bold shadow-md'
            : 'text-slate-700 hover:bg-slate-100 hover:text-black'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
          {isEditing ? (
            <form onSubmit={(e) => handleSaveRename(session.id, e)} className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                autoFocus
                className="w-full bg-slate-100 text-black text-xs px-2 py-1 rounded border border-black focus:outline-none"
              />
              <button type="submit" className="p-1 text-emerald-600 hover:text-emerald-700">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="truncate text-xs tracking-wide">
              {session.title || 'New Chat'}
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinSession(session.id);
              }}
              className={`p-1 rounded hover:bg-slate-200 ${session.isPinned ? 'text-emerald-600' : 'text-slate-400'}`}
              title={session.isPinned ? t.unpin : t.pin}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleStartRename(session, e)}
              className="p-1 text-slate-400 hover:text-black rounded hover:bg-slate-200"
              title={t.rename}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(t.deleteConfirm)) {
                  onDeleteSession(session.id);
                }
              }}
              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200"
              title={t.delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }
};
