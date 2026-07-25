export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string; // Object URL or data URI
  mimeType: string;
  base64Data?: string; // Standard base64 without prefix
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  groundingSources?: GroundingSource[];
  isError?: boolean;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  personaId: string;
  useSearch?: boolean;
  isPinned?: boolean;
}

export interface AIPersona {
  id: string;
  nameKurdish: string;
  nameEnglish: string;
  descriptionKurdish: string;
  descriptionEnglish: string;
  systemInstruction: string;
  icon: string;
  color: string;
}

export type Language = 'ckb' | 'en' | 'ar';
