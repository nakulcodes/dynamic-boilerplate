import React from 'react';
import { FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface FileTreePreviewProps {
  selectedPreset: string;
  selectedModules: string[];
}

export const FileTreePreview: React.FC<FileTreePreviewProps> = ({
  selectedPreset,
  selectedModules,
}) => {
  const getFileTree = () => {
    if (!selectedPreset) return [];

    // Base structure for NestJS
    const baseFiles = [
      { name: 'package.json', type: 'file', level: 0 },
      { name: 'tsconfig.json', type: 'file', level: 0 },
      { name: '.env.example', type: 'file', level: 0 },
      { name: 'README.md', type: 'file', level: 0 },
      { name: 'src', type: 'folder', level: 0 },
      { name: 'main.ts', type: 'file', level: 1 },
      { name: 'app.module.ts', type: 'file', level: 1 },
      { name: 'app.controller.ts', type: 'file', level: 1 },
      { name: 'app.service.ts', type: 'file', level: 1 },
      { name: 'auth', type: 'folder', level: 1 },
      { name: 'auth.module.ts', type: 'file', level: 2 },
      { name: 'auth.service.ts', type: 'file', level: 2 },
      { name: 'auth.controller.ts', type: 'file', level: 2 },
      { name: 'users', type: 'folder', level: 1 },
      { name: 'users.module.ts', type: 'file', level: 2 },
      { name: 'users.service.ts', type: 'file', level: 2 },
      { name: 'user.entity.ts', type: 'file', level: 2 },
      { name: 'common', type: 'folder', level: 1 },
      { name: 'logging', type: 'folder', level: 2 },
    ];

    // Add module-specific files
    const moduleFiles = [];

    if (selectedModules.includes('google-oauth')) {
      moduleFiles.push(
        { name: 'google-oauth', type: 'folder', level: 2, parent: 'auth' },
        { name: 'google-oauth.module.ts', type: 'file', level: 3, parent: 'google-oauth' },
        { name: 'google.strategy.ts', type: 'file', level: 3, parent: 'google-oauth' }
      );
    }

    if (selectedModules.includes('google-calendar')) {
      moduleFiles.push(
        { name: 'integrations', type: 'folder', level: 1 },
        { name: 'google-calendar', type: 'folder', level: 2, parent: 'integrations' },
        { name: 'google-calendar.module.ts', type: 'file', level: 3, parent: 'google-calendar' },
        { name: 'google-calendar.service.ts', type: 'file', level: 3, parent: 'google-calendar' }
      );
    }

    if (selectedModules.includes('enhanced-logging')) {
      moduleFiles.push(
        { name: 'enhanced-logging', type: 'folder', level: 2, parent: 'common' },
        { name: 'elasticsearch.service.ts', type: 'file', level: 3, parent: 'enhanced-logging' },
        { name: 'metrics.service.ts', type: 'file', level: 3, parent: 'enhanced-logging' }
      );
    }

    return [...baseFiles, ...moduleFiles];
  };

  const files = getFileTree();

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Project Structure Preview</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
        {files.length > 0 ? (
          <div className="space-y-1 font-mono text-sm">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center"
                style={{ paddingLeft: `${file.level * 20}px` }}
              >
                {file.type === 'folder' ? (
                  <FolderIcon className="h-4 w-4 mr-2 text-blue-500" />
                ) : (
                  <DocumentIcon className="h-4 w-4 mr-2 text-gray-400" />
                )}
                <span className={file.type === 'folder' ? 'font-medium' : ''}>
                  {file.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Select a preset to see the project structure</p>
        )}
      </div>
    </div>
  );
};