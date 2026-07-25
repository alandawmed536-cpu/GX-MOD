import { ChatSession, Language } from '../types';

const STORAGE_KEY_SESSIONS = 'lumaai_sessions_v3';
const STORAGE_KEY_ACTIVE = 'lumaai_active_session_v3';
const STORAGE_KEY_LANG = 'lumaai_language_v3';
const STORAGE_KEY_THEME = 'lumaai_theme_v3';

export function loadStoredSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load stored sessions:', err);
    return [];
  }
}

export function saveStoredSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions to localStorage:', err);
  }
}

export function loadActiveSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE);
  } catch {
    return null;
  }
}

export function saveActiveSessionId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE);
    }
  } catch (err) {
    console.error('Failed to save active session ID:', err);
  }
}

export function loadStoredLanguage(): Language {
  try {
    const lang = localStorage.getItem(STORAGE_KEY_LANG) as Language;
    if (lang === 'ckb' || lang === 'en' || lang === 'ar') return lang;
  } catch {}
  return 'en'; // Default primary language is English as requested
}

export function saveStoredLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  } catch {}
}

export function loadStoredTheme(): 'dark' | 'light' {
  try {
    const theme = localStorage.getItem(STORAGE_KEY_THEME);
    if (theme === 'dark' || theme === 'light') return theme;
  } catch {}
  return 'dark'; // Pure Black ChatGPT Mode
}

export function saveStoredTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch {}
}

export function exportBackupData(sessions: ChatSession[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `LumaAi_chat_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportSingleSessionMarkdown(session: ChatSession): void {
  let md = `# ${session.title}\n\n_Created: ${new Date(session.createdAt).toLocaleString()}_\n\n---\n\n`;
  for (const msg of session.messages) {
    const sender = msg.role === 'user' ? '👤 User' : '✨ LumaAi';
    md += `### ${sender} (${new Date(msg.timestamp).toLocaleTimeString()})\n\n${msg.content}\n\n`;
    if (msg.attachments && msg.attachments.length > 0) {
      md += `*Attached Files:* ${msg.attachments.map(a => a.name).join(', ')}\n\n`;
    }
  }
  
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.replace(/[^a-zA-Z0-9آ-ی]/g, '_')}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
