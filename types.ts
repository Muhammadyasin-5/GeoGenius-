export enum FileCategory {
  SATELLITE = 'satellite',
  MAPS = 'maps',
  GEOCHEM = 'geochem',
  GEOPHYSICS = 'geophysics',
  FIELD_PETROLOGY = 'field_petrology'
}

export interface UploadedFile {
  id: string;
  sourceType: 'file' | 'url';
  file?: File;
  url?: string;
  category: FileCategory;
  previewUrl?: string;
  base64?: string;
}

export interface Zone {
  type: string;
  area: string; // e.g., "35%"
  color: string;
}

export interface TargetArea {
  id: number;
  x: number; // 0-100
  y: number; // 0-100
  probability: number; // 0-1
  description: string;
  reasoning?: string; // Specific geological reasoning for this target
}

export interface PredictionResult {
  porphyryPotential: string;
  epithermalPotential: string;
  confidenceScore: number;
  alterationMinerals: string[];
  zones: Zone[];
  targetAreas: TargetArea[];
  recommendedActions: string[];
  reasoning: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}