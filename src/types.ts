export interface VoiceNoteData {
  audioBlobUrl?: string;
  audioBase64?: string;
  mimeType: string;
  durationSeconds: number;
  transcription?: string;
}

export type ConnectorCategory = 
  | 'cloud-infra' 
  | 'developer' 
  | 'data-sql' 
  | 'productivity' 
  | 'knowledge-rag' 
  | 'apis-webhooks';

export interface ConnectorDefinition {
  id: string;
  name: string;
  category: ConnectorCategory;
  description: string;
  icon: string;
  badge: string;
  enabled: boolean;
  isPopular?: boolean;
  capabilities: string[];
  configOptions?: {
    [key: string]: {
      label: string;
      type: 'text' | 'select' | 'boolean';
      default: any;
      options?: string[];
    };
  };
}

export interface ConnectorExecutionLog {
  connectorId: string;
  connectorName: string;
  action: string;
  timestamp: string;
  status: 'success' | 'running' | 'error';
  durationMs: number;
  inputSummary: string;
  outputSummary: string;
  details?: any;
}

export interface UploadedAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'image' | 'book' | 'document' | 'video' | 'audio' | 'code' | 'other';
  dataUrl?: string;
  previewUrl?: string;
  base64?: string;
  textSnippet?: string;
  pageCount?: number;
}

export interface GeneratedImageData {
  url: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  revisedPrompt?: string;
  modelUsed?: string;
}

export interface GeneratedVideoData {
  url: string;
  prompt: string;
  aspectRatio?: string;
  resolution?: string;
  thumbnail?: string;
  status: 'processing' | 'ready' | 'error';
  progress?: number;
  operationName?: string;
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  voiceNote?: VoiceNoteData;
  attachments?: UploadedAttachment[];
  generatedImage?: GeneratedImageData;
  generatedVideo?: GeneratedVideoData;
  audioResponseUrl?: string;
  audioResponseBase64?: string;
  isVoicePlaying?: boolean;
  connectorLogs?: ConnectorExecutionLog[];
  groundingSources?: Array<{
    title: string;
    url: string;
  }>;
  modelUsed?: string;
  isQuotaFallback?: boolean;
}

export interface ChatSession {
  id: string;
  userId?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  activeConnectorIds: string[];
  systemPrompt?: string;
  voiceModeOnly?: boolean;
}

export interface UserPreferences {
  defaultVoice: 'Zephyr' | 'Puck' | 'Aoede' | 'Charon' | 'Fenrir';
  autoVoicePlayback: boolean;
  streamResponses: boolean;
  theme: 'dark' | 'midnight' | 'system';
  favoriteConnectors: string[];
}

export interface UserStats {
  messagesSent: number;
  voiceNotesRecorded: number;
  connectorsExecuted: number;
  storageReadMb: number;
  filesUploaded?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  company: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  createdAt: string;
  preferences: UserPreferences;
  stats: UserStats;
  connectedAccounts?: {
    google?: boolean;
    github?: boolean;
    aws?: boolean;
    slack?: boolean;
  };
}

export interface CloudSampleFile {
  name: string;
  size: string;
  type: string;
  bucket: string;
  updated: string;
  sampleContent: string;
}

