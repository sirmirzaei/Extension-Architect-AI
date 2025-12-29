
export type BrowserType = 'chrome' | 'firefox' | 'safari';

export interface ExtensionFile {
  path: string;
  content: string;
}

export interface ExtensionProject {
  id: string;
  name: string;
  browser: BrowserType;
  files: Record<string, string>;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum AIModel {
  GEMINI_PRO = 'gemini-3-pro-preview',
  GEMINI_FLASH = 'gemini-3-flash-preview',
  OPENAI_GPT4 = 'gpt-4o-proxy',
  CLAUDE_3_SONNET = 'claude-3-5-sonnet-proxy',
  OLLAMA_LOCAL = 'ollama-llama3-local'
}

export interface ChatUpdateResponse {
  explanation: string;
  updatedFiles?: { path: string; content: string }[];
}
