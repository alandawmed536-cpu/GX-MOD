import React, { useState, useRef } from 'react';
import { 
  Send, 
  Square, 
  Paperclip, 
  Globe, 
  X, 
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { Attachment, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  onStopStreaming: () => void;
  language: Language;
  useSearch: boolean;
  setUseSearch: (use: boolean | ((prev: boolean) => boolean)) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopStreaming,
  language,
  useSearch,
  setUseSearch
}) => {
  const t = TRANSLATIONS[language];
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const base64Data = dataUrl.split(',')[1];

        newAttachments.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: isImage ? 'image' : 'file',
          url: dataUrl,
          mimeType: file.type || (isImage ? 'image/png' : 'application/octet-stream'),
          base64Data,
        });

        if (newAttachments.length === files.length) {
          setAttachments(prev => [...prev, ...newAttachments]);
        }
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="sticky bottom-0 z-10 p-3 md:p-4 bg-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Attachments preview tray */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xl">
            {attachments.map(att => (
              <div
                key={att.id}
                className="relative group flex items-center gap-2 p-1.5 pr-3 bg-slate-100 rounded-xl text-xs font-medium text-slate-800"
              >
                {att.type === 'image' ? (
                  <img src={att.url} alt={att.name} className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                )}
                <span className="truncate max-w-[120px]">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 rounded-full hover:bg-slate-200 text-slate-500 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pure White Input Bar floating over Black Canvas */}
        <div className="relative flex items-end gap-2 p-2.5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-2xl focus-within:ring-2 focus-within:ring-black transition-all">
          
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-600 hover:text-black hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            title={t.uploadImage}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,.txt,.pdf,.js,.ts,.py"
            className="hidden"
          />

          {/* Search Toggle Switch */}
          <button
            onClick={() => setUseSearch(prev => !prev)}
            className={`p-2.5 rounded-xl transition-colors shrink-0 ${
              useSearch 
                ? 'text-blue-700 bg-blue-50 border border-blue-200 font-bold' 
                : 'text-slate-500 hover:text-black hover:bg-slate-100'
            }`}
            title={t.useSearch}
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder={t.enterPrompt}
            rows={1}
            className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none resize-none py-2 px-1 max-h-[180px] leading-relaxed font-sans"
          />

          {/* Submit or Stop Button */}
          {isLoading ? (
            <button
              onClick={onStopStreaming}
              className="p-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-500 shadow-md transition-all shrink-0 flex items-center justify-center"
              title={t.stop}
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() && attachments.length === 0}
              className={`p-2.5 rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center ${
                inputText.trim() || attachments.length > 0
                  ? 'bg-black text-white hover:bg-slate-800 active:scale-95'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title={t.send}
            >
              <Send className={`w-4 h-4 ${language === 'ckb' || language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between mt-2 px-2 text-[11px] text-zinc-400">
          <span>{t.createdNotice}</span>
          <span className="font-mono text-zinc-400 font-semibold">{t.modelLabel}</span>
        </div>

      </div>
    </div>
  );
};
