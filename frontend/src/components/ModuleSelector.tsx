import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Puzzle, AlertTriangle, CheckCircle2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModuleInfo } from '../types';

interface ModuleSelectorProps {
  modules: ModuleInfo[];
  selectedModules: string[];
  onModuleChange: (modules: string[]) => void;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  modules,
  selectedModules,
  onModuleChange,
}) => {
  const handleModuleToggle = (moduleName: string) => {
    const newSelection = selectedModules.includes(moduleName)
      ? selectedModules.filter(m => m !== moduleName)
      : [...selectedModules, moduleName];

    onModuleChange(newSelection);
  };

  const getConflicts = (moduleName: string) => {
    const module = modules.find(m => m.name === moduleName);
    return module?.conflicts?.filter(conflict => selectedModules.includes(conflict)) || [];
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Puzzle className="h-5 w-5 text-zinc-400" />
          <h2 className="text-2xl font-semibold text-zinc-50 tracking-tight">
            Select Modules
          </h2>
        </div>
        <p className="text-zinc-400">
          Choose additional features and integrations for your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module, index) => {
          const isSelected = selectedModules.includes(module.name);
          const conflicts = getConflicts(module.name);
          const hasConflicts = conflicts.length > 0;

          return (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'relative p-5 cursor-pointer transition-all duration-200 group glass-card',
                  'hover:border-zinc-800',
                  hasConflicts && 'border-destructive/50 bg-destructive/5',
                  isSelected && !hasConflicts && 'border-white/50 bg-white/5'
                )}
                onClick={() => !hasConflicts && handleModuleToggle(module.name)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <Checkbox
                      checked={isSelected}
                      disabled={hasConflicts}
                      className="data-[state=checked]:bg-white data-[state=checked]:border-white"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className={cn(
                            'h-4 w-4',
                            isSelected ? 'text-white' : 'text-zinc-400'
                          )} />
                          <h3 className="font-semibold text-zinc-50">
                            {module.name}
                          </h3>
                        </div>

                        <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                          {module.description}
                        </p>

                        {/* Status indicators */}
                        <div className="flex items-center space-x-2">
                          {isSelected && !hasConflicts && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-1"
                            >
                              <CheckCircle2 className="h-3 w-3 text-white" />
                              <span className="text-xs font-medium text-white">
                                Selected
                              </span>
                            </motion.div>
                          )}

                          {hasConflicts && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-1"
                            >
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                              <span className="text-xs font-medium text-red-500">
                                Conflicts with: {conflicts.join(', ')}
                              </span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Selected modules summary */}
      <AnimatePresence>
        {selectedModules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <Card className="p-4 glass-card border-white/20 bg-white/5">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-zinc-50">
                  Selected Modules ({selectedModules.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedModules.map((moduleName) => (
                  <Badge
                    key={moduleName}
                    variant="secondary"
                    className="bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    {moduleName}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};