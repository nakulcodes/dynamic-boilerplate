export interface FileStructureItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileStructureItem[];
}

export interface ModuleInfo {
  name: string;
  description: string;
  category: string;
  conflicts: string[];
  fileStructure: FileStructureItem[];
}

export interface PresetInfo {
  name: string;
  description: string;
  modules: ModuleInfo[];
}

export interface GenerateRequest {
  preset: string;
  modules: string[];
  projectName: string;
  author?: string;
  output: {
    type: 'zip' | 'github';
    github?: {
      owner: string;
      repoName: string;
      authMethod: 'oauth' | 'github_app';
    };
  };
  options?: {
    runInstall?: boolean;
    nodeVersion?: string;
  };
}

export interface GenerateResponse {
  status: 'success' | 'error' | 'queued';
  outputUrl?: string;
  downloadUrl?: string;
  fileName?: string;
  repoUrl?: string;
  envRequired?: string[];
  error?: string;
  taskId?: string;
}