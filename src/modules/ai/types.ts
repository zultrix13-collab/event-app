export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  sessionToken: string;
  language: 'mn' | 'en';
  isEscalated: boolean;
}

export interface KbChunk {
  id: string;
  documentId: string;
  content: string;
  contentEn: string | null;
  similarity?: number;
}

export interface ChatResponse {
  message: string;
  language: 'mn' | 'en';
  sources: string[];
  sessionId: string;
  shouldEscalate: boolean;
}
