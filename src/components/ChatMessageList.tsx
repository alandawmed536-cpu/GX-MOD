import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Globe, 
  FileText, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PERSONAS } from '../data/personas';

interface ChatMessageListProps {
  messages: ChatMessage[];
  language: Language;
  personaId: string;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  language,
  personaId
}) => {
  const t = TRANSLATIONS[language];
  const activePersona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages.length, messages[messages.length - 1]?.content]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleToggleSpeech = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMessageId === id) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'ckb' ? 'ku' : language === 'ar' ? 'ar-SA' : 'en-US';
        utterance.onend = () => setSpeakingMessageId(null);
        utterance.onerror = () => setSpeakingMessageId(null);
        setSpeakingMessageId(id);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-black text-white">
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        const isCopied = copiedMessageId === msg.id;
        const isSpeaking = speakingMessageId === msg.id;

        return (
          <div
            key={msg.id}
            className={`flex gap-3 md:gap-4 max-w-4xl mx-auto ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0 shadow-md text-white font-bold ${
                isUser
                  ? 'bg-zinc-800 border border-zinc-700'
                  : 'bg-white text-black border border-slate-200'
              }`}
            >
              {isUser ? <User className="w-4 h-4 text-zinc-300" /> : <Sparkles className="w-4 h-4 text-black fill-black" />}
            </div>

            {/* Content Container (Notice: Header name labels REMOVED per user instructions) */}
            <div className={`flex flex-col max-w-[85%] md:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
              
              {/* Attachments preview */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="relative group rounded-xl overflow-hidden border border-zinc-700 max-w-[200px] bg-zinc-900"
                    >
                      {att.type === 'image' ? (
                        <img
                          src={att.url}
                          alt={att.name}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="p-3 flex items-center gap-2 text-xs font-medium text-zinc-200">
                          <FileText className="w-5 h-5 text-emerald-400" />
                          <span className="truncate">{att.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all shadow-sm ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700'
                    : 'bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-tl-none'
                } ${msg.isError ? 'bg-rose-950/80 text-rose-200 border-rose-800' : ''}`}
              >
                {msg.isError ? (
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                    <span>{msg.content}</span>
                  </div>
                ) : (
                  <div className="markdown-body prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:text-zinc-100 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');

                          if (!inline && match) {
                            return (
                              <div className="relative group my-3 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                                <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 text-zinc-400 text-xs font-mono border-b border-zinc-800">
                                  <span>{match[1]}</span>
                                  <button
                                    onClick={() => handleCopyText(codeString, `code-${msg.id}-${Math.random()}`)}
                                    className="flex items-center gap-1 text-zinc-300 hover:text-white"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{t.copy}</span>
                                  </button>
                                </div>
                                <pre className="p-4 overflow-x-auto text-xs font-mono text-zinc-200">
                                  <code>{children}</code>
                                </pre>
                              </div>
                            );
                          }
                          return (
                            <code className="bg-zinc-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                              {children}
                            </code>
                          );
                        },
                        a({ href, children }: any) {
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 underline hover:opacity-80 inline-flex items-center gap-0.5"
                            >
                              {children}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Grounding Sources (Google Search results) */}
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 w-full space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>{t.searchGrounding}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-200 border border-zinc-700 hover:border-blue-500 transition-colors"
                      >
                        <span className="truncate max-w-[180px] font-medium">{source.title}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Actions (Copy & Voice TTS) */}
              {!isUser && msg.content && !msg.isError && (
                <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
                  <button
                    onClick={() => handleCopyText(msg.content, msg.id)}
                    className="flex items-center gap-1 p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title={t.copy}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? t.copied : t.copy}</span>
                  </button>

                  <button
                    onClick={() => handleToggleSpeech(msg.content, msg.id)}
                    className={`flex items-center gap-1 p-1 rounded hover:bg-zinc-800 transition-colors ${
                      isSpeaking ? 'text-emerald-400 font-bold' : 'text-zinc-400'
                    }`}
                    title={isSpeaking ? t.stopSpeaking : t.speak}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeaking ? t.stopSpeaking : t.speak}</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};
