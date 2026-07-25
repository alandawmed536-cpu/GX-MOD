import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatSession, 
  ChatMessage, 
  Attachment, 
  Language 
} from './types';
import { 
  loadStoredSessions, 
  saveStoredSessions, 
  loadActiveSessionId, 
  saveActiveSessionId, 
  loadStoredLanguage, 
  saveStoredLanguage, 
  loadStoredTheme, 
  saveStoredTheme 
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessageList } from './components/ChatMessageList';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';
import { PERSONAS } from './data/personas';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadStoredSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => loadActiveSessionId());
  const [language, setLanguage] = useState<Language>(() => loadStoredLanguage());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadStoredTheme());
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activePersonaId, setActivePersonaId] = useState<string>('luma-ai');
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Apply theme and document attributes
  useEffect(() => {
    saveStoredTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    saveStoredLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = (language === 'ckb' || language === 'ar') ? 'rtl' : 'ltr';
  }, [language]);

  // Sync sessions to localStorage whenever they change
  useEffect(() => {
    saveStoredSessions(sessions);
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Active session helper
  const currentSession = sessions.find(s => s.id === activeSessionId) || null;

  // Handle New Chat creation
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substring(2, 11),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      personaId: activePersonaId,
      useSearch: useSearch,
      isPinned: false,
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Select session
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      if (session.personaId) setActivePersonaId(session.personaId);
    }
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        const nextActive = filtered[0]?.id || null;
        setActiveSessionId(nextActive);
      }
      return filtered;
    });
  };

  // Toggle Pin session
  const handleTogglePinSession = (id: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isPinned: !s.isPinned };
      }
      return s;
    }));
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, title: newTitle, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    setSessions([]);
    setActiveSessionId(null);
  };

  // Import Backup
  const handleImportBackup = (importedSessions: ChatSession[]) => {
    setSessions(importedSessions);
    if (importedSessions.length > 0) {
      setActiveSessionId(importedSessions[0].id);
    }
  };

  // Stop Streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Send Message & Call Gemini API endpoint with line-buffered SSE stream parsing
  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    let sessionId = activeSessionId;
    let targetSession = sessions.find(s => s.id === sessionId);

    // If no active session exists, create a new one
    if (!sessionId || !targetSession) {
      const generatedTitle = text ? (text.slice(0, 28) + (text.length > 28 ? '...' : '')) : 'New Chat';
      const newSession: ChatSession = {
        id: Math.random().toString(36).substring(2, 11),
        title: generatedTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        personaId: activePersonaId,
        useSearch: useSearch,
        isPinned: false,
      };

      sessionId = newSession.id;
      targetSession = newSession;
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(sessionId);
    } else if (targetSession.messages.length === 0 && text) {
      const generatedTitle = text.slice(0, 28) + (text.length > 28 ? '...' : '');
      handleRenameSession(sessionId, generatedTitle);
    }

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 11),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const assistantMessageId = Math.random().toString(36).substring(2, 11);
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    // Update state with user message and initial assistant placeholder message
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          updatedAt: Date.now(),
          messages: [...s.messages, userMessage, assistantMessage],
        };
      }
      return s;
    }));

    setIsLoading(true);

    const activePersona = PERSONAS.find(p => p.id === activePersonaId) || PERSONAS[0];
    const currentMessages = targetSession ? [...targetSession.messages, userMessage] : [userMessage];
    
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          personaInstruction: activePersona.systemInstruction,
          useSearch: useSearch,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body reader is unavailable');
      }

      let accumulatedText = '';
      let accumulatedSources: Array<{ title: string; url: string }> = [];
      let sseBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        // Keep last potentially incomplete line in buffer
        sseBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.text) {
                accumulatedText += data.text;
              }

              if (data.groundingSources && Array.isArray(data.groundingSources)) {
                accumulatedSources = [...accumulatedSources, ...data.groundingSources];
              }

              setSessions(prev => prev.map(s => {
                if (s.id === sessionId) {
                  return {
                    ...s,
                    messages: s.messages.map(m => {
                      if (m.id === assistantMessageId) {
                        return {
                          ...m,
                          content: accumulatedText,
                          groundingSources: accumulatedSources.length > 0 ? accumulatedSources : undefined,
                        };
                      }
                      return m;
                    }),
                  };
                }
                return s;
              }));
            } catch (parseErr) {
              // Ignore non-fatal JSON parse glitches during partial chunks
            }
          }
        }
      }

      // Finalize assistant message
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: s.messages.map(m => {
              if (m.id === assistantMessageId) {
                return {
                  ...m,
                  isStreaming: false,
                };
              }
              return m;
            }),
          };
        }
        return s;
      }));

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream stopped by user');
      } else {
        console.error('Chat error:', err);
        setSessions(prev => prev.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: s.messages.map(m => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    content: err.message || 'Sorry, an error occurred while connecting to LumaAi.',
                    isError: true,
                    isStreaming: false,
                  };
                }
                return m;
              }),
            };
          }
          return s;
        }));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">
      
      {/* Drawer / Sidebar Menu */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        onRenameSession={handleRenameSession}
        onClearAllSessions={handleClearAllSessions}
        onImportBackup={handleImportBackup}
        activePersonaId={activePersonaId}
        onChangePersona={(id) => setActivePersonaId(id)}
        language={language}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative bg-black">
        
        {/* Sticky Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentSession={currentSession}
          onNewChat={handleNewChat}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggleTheme}
          useSearch={useSearch}
          setUseSearch={setUseSearch}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Chat Messages or Welcome Screen */}
        {currentSession && currentSession.messages.length > 0 ? (
          <ChatMessageList
            messages={currentSession.messages}
            language={language}
            personaId={currentSession.personaId || activePersonaId}
          />
        ) : (
          <WelcomeScreen
            onSelectPrompt={(promptText) => handleSendMessage(promptText, [])}
            language={language}
            activePersonaId={activePersonaId}
          />
        )}

        {/* Bottom Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopStreaming={handleStopStreaming}
          language={language}
          useSearch={useSearch}
          setUseSearch={setUseSearch}
        />

      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onSelectLanguage={setLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        onClearAllSessions={handleClearAllSessions}
      />
    </div>
  );
}
