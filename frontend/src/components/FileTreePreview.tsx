import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FolderOpen,
  FileText,
  Package,
  Settings,
  FileCode,
  Eye,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModuleInfo } from '../types';

interface FileTreePreviewProps {
  selectedPreset: string;
  selectedModules: string[];
  modules?: ModuleInfo[];
}

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  level: number;
  parent?: string;
  isNew?: boolean;
}

export const FileTreePreview: React.FC<FileTreePreviewProps> = ({
  selectedPreset,
  selectedModules,
  modules = [],
}) => {
  const getFileTree = (): FileItem[] => {
    if (!selectedPreset) return [];

    // Base structure for NestJS
    const baseFiles: FileItem[] = [
      { name: 'package.json', type: 'file', level: 0 },
      { name: 'tsconfig.json', type: 'file', level: 0 },
      { name: '.env.example', type: 'file', level: 0 },
      { name: 'README.md', type: 'file', level: 0 },
      { name: 'src', type: 'folder', level: 0 },
      { name: 'main.ts', type: 'file', level: 1 },
      { name: 'app.module.ts', type: 'file', level: 1 },
      { name: 'app.controller.ts', type: 'file', level: 1 },
      { name: 'app.service.ts', type: 'file', level: 1 },
      { name: 'common', type: 'folder', level: 1 },
      { name: 'modules', type: 'folder', level: 1 },
    ];

    // Add module-specific files dynamically
    const moduleFiles: FileItem[] = [];

    selectedModules.forEach(moduleName => {
      const module = modules.find(m => m.name === moduleName);
      if (module && module.fileStructure) {
        module.fileStructure.forEach((structure) => {
          const pathParts = structure.path.split('/');
          let currentLevel = 0;

          // Add folder structure based on path
          pathParts.forEach((part: string, index: number) => {
            if (part && part !== 'src') { // Skip src as it's already in base
              const isLast = index === pathParts.length - 1;
              if (isLast) {
                // This is the main folder for the module
                moduleFiles.push({
                  name: structure.name,
                  type: structure.type,
                  level: currentLevel + 1,
                  isNew: true
                });

                // Add children files
                if (structure.children) {
                  structure.children.forEach((child) => {
                    moduleFiles.push({
                      name: child.name,
                      type: child.type,
                      level: currentLevel + 2,
                      parent: structure.name,
                      isNew: true
                    });

                    // Add nested children if they exist
                    if (child.children) {
                      child.children.forEach((grandchild) => {
                        moduleFiles.push({
                          name: grandchild.name,
                          type: grandchild.type,
                          level: currentLevel + 3,
                          parent: child.name,
                          isNew: true
                        });
                      });
                    }
                  });
                }
              } else {
                // This is an intermediate folder
                if (!moduleFiles.find(f => f.name === part && f.level === currentLevel + 1)) {
                  moduleFiles.push({
                    name: part,
                    type: 'folder',
                    level: currentLevel + 1,
                    isNew: true
                  });
                }
              }
              currentLevel++;
            }
          });
        });
      }
    });

    return [...baseFiles, ...moduleFiles];
  };

  const getFileIcon = (fileName: string, type: 'file' | 'folder') => {
    if (type === 'folder') {
      return <FolderOpen className="h-4 w-4 text-blue-400" />;
    }

    if (fileName.endsWith('.json')) {
      return <Settings className="h-4 w-4 text-yellow-400" />;
    }
    if (fileName.endsWith('.ts')) {
      return <FileCode className="h-4 w-4 text-blue-300" />;
    }
    if (fileName.endsWith('.md')) {
      return <FileText className="h-4 w-4 text-green-400" />;
    }
    if (fileName.includes('env')) {
      return <Package className="h-4 w-4 text-orange-400" />;
    }

    return <FileText className="h-4 w-4 text-zinc-400" />;
  };

  const files = getFileTree();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-zinc-400" />
          <h3 className="text-xl font-semibold text-zinc-50 tracking-tight">
            Project Preview
          </h3>
        </div>
        <p className="text-sm text-zinc-400">
          Live preview of your generated project structure
        </p>
      </div>

      <Card className="glass-card border-zinc-800/50 overflow-hidden">
        <div className="p-4 border-b border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-white" />
              <span className="font-medium text-zinc-50">File Structure</span>
            </div>
            {selectedModules.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-white/10 text-white">
                {selectedModules.length} modules added
              </Badge>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            {files.length > 0 ? (
              <motion.div
                key="file-tree"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-1"
              >
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className={cn(
                      "flex items-center py-1 px-2 rounded-md transition-colors font-mono text-sm",
                      "hover:bg-zinc-800/50",
                      file.isNew && "bg-white/5 border border-white/20"
                    )}
                    style={{ paddingLeft: `${file.level * 20 + 8}px` }}
                  >
                    {getFileIcon(file.name, file.type)}

                    <span className={cn(
                      "ml-2 flex-1",
                      file.type === 'folder' ? 'font-semibold text-zinc-50' : 'text-zinc-400',
                      file.isNew && 'text-white font-medium'
                    )}>
                      {file.name}
                    </span>

                    {file.isNew && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center space-x-1 ml-2"
                      >
                        <Sparkles className="h-3 w-3 text-white" />
                        <span className="text-xs text-white font-medium">New</span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <FolderOpen className="h-12 w-12 text-zinc-400/50 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">
                  Select a preset to see the project structure
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedModules.length > 0 && (
          <>
            <Separator />
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-zinc-50">Module Additions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedModules.map((moduleName) => (
                  <Badge
                    key={moduleName}
                    variant="secondary"
                    className="text-xs bg-white/10 text-white"
                  >
                    {moduleName}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};