import React from 'react';
import { 
  Sparkles, 
  Code2, 
  Languages, 
  BookOpen, 
  ShieldCheck, 
  Smartphone, 
  Globe2, 
  FileSearch
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PERSONAS } from '../data/personas';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
  language: Language;
  activePersonaId: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  language,
  activePersonaId
}) => {
  const t = TRANSLATIONS[language];
  const activePersona = PERSONAS.find(p => p.id === activePersonaId) || PERSONAS[0];

  const quickPrompts = [
    { text: t.quickPrompt1, icon: Code2 },
    { text: t.quickPrompt2, icon: Sparkles },
    { text: t.quickPrompt3, icon: Languages },
    { text: t.quickPrompt4, icon: BookOpen },
  ];

  const features = [
    { title: 'LumaAi Core', desc: 'Developed by Kurdish Developer', icon: ShieldCheck },
    { title: 'Pure Black Canvas', desc: 'ChatGPT style high-contrast UI', icon: Smartphone },
    { title: 'Google Web Search', desc: 'Real-time updated search grounding', icon: Globe2 },
    { title: 'Multimodal Files', desc: 'Image and document analysis', icon: FileSearch },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto text-center space-y-8 animate-fadeIn bg-black text-white">
      
      {/* Central Hero Logo */}
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-white text-black flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform">
          <Sparkles className="w-8 h-8 text-black fill-black" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          LumaAi
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          {language === 'ckb' ? activePersona.descriptionKurdish : activePersona.descriptionEnglish}
        </p>
      </div>

      {/* Quick Starter Cards - Clean High Contrast White Cards */}
      <div className="w-full space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          {t.quickPromptsTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickPrompts.map((prompt, idx) => {
            const Icon = prompt.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt(prompt.text)}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 hover:shadow-xl transition-all text-left group"
              >
                <div className="p-2.5 rounded-xl bg-black text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-black transition-colors leading-relaxed">
                  {prompt.text}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="w-full pt-4 border-t border-zinc-800">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
                <Icon className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                <h3 className="text-xs font-bold text-zinc-200">{feat.title}</h3>
                <p className="text-[10px] text-zinc-400 line-clamp-2">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
