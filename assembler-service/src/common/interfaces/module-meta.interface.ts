export interface ModuleMeta {
  name: string;
  description: string;
  deps?: Record<string, string>;
  devDeps?: Record<string, string>;
  env?: (string | { key: string; required: boolean; example?: string })[];
  filesPath?: string;
  conflicts?: string[];
  inject?: Record<string, {
    import?: string[];
    register?: string[];
  }>;
  postInstall?: string[];
}

export interface GenerationResult {
  status: 'success' | 'error';
  outputUrl?: string;
  downloadUrl?: string;
  fileName?: string;
  repoUrl?: string;
  envRequired?: string[];
  error?: string;
}

export interface PresetInfo {
  name: string;
  description: string;
  modules: ModuleInfo[];
}

export interface ModuleInfo {
  name: string;
  description: string;
  conflicts: string[];
}