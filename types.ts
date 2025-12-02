export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface AudioFile {
  name: string;
  url: string;
  base64: string;
  mimeType: string;
}

export interface RemixResult {
  audioUrl: string;
  description: string;
}
