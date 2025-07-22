export type ProcessingState = 'idle' | 'processing' | 'ready' | 'error';

export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  transcript: string;
  chunks: TextChunk[];
  embeddings: number[][];
}

export interface TextChunk {
  id: string;
  text: string;
  startTime?: number;
  endTime?: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string[];
}

export interface ProcessingStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description?: string;
}