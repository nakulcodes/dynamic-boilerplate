import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  Key,
  Zap,
  Settings,
  Cloud,
  BarChart3,
  Package,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModuleInfo } from '../types';

interface SteppedModuleSelectorProps {
  modules: ModuleInfo[];
  selectedModules: string[];
  onModuleChange: (modules: string[]) => void;
}

interface ModuleCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  modules: ModuleInfo[];
}

const categoryIcons = {
  database: Database,
  security: Shield,
  authentication: Key,
  performance: Zap,
  configuration: Settings,
  storage: Cloud,
  monitoring: BarChart3,
  documentation: FileText,
  other: Package,
};

const categoryColors = {
  database: 'from-blue-500 to-cyan-500',
  security: 'from-red-500 to-pink-500',
  authentication: 'from-green-500 to-emerald-500',
  performance: 'from-yellow-500 to-orange-500',
  configuration: 'from-purple-500 to-violet-500',
  storage: 'from-indigo-500 to-blue-500',
  monitoring: 'from-teal-500 to-cyan-500',
  documentation: 'from-gray-500 to-slate-500',
  other: 'from-zinc-500 to-gray-500',
};

export const SteppedModuleSelector: React.FC<SteppedModuleSelectorProps> = ({
  modules,
  selectedModules,
  onModuleChange,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Categorize modules based on their category field from meta.json
  const categories = useMemo((): ModuleCategory[] => {
    const categorizedModules = {
      database: [] as ModuleInfo[],
      security: [] as ModuleInfo[],
      authentication: [] as ModuleInfo[],
      performance: [] as ModuleInfo[],
      configuration: [] as ModuleInfo[],
      storage: [] as ModuleInfo[],
      monitoring: [] as ModuleInfo[],
      documentation: [] as ModuleInfo[],
      core: [] as ModuleInfo[],
      cache: [] as ModuleInfo[],
      communication: [] as ModuleInfo[],
      other: [] as ModuleInfo[],
    };

    modules.forEach(module => {
      const category = module.category || 'other';

      // Map API categories to our display categories
      switch (category) {
        case 'core':
          categorizedModules.database.push(module); // Core modules like database go to database category
          break;
        case 'authentication':
          categorizedModules.authentication.push(module);
          break;
        case 'security':
          categorizedModules.security.push(module);
          break;
        case 'cache':
        case 'performance':
          categorizedModules.performance.push(module);
          break;
        case 'configuration':
        case 'config':
          categorizedModules.configuration.push(module);
          break;
        case 'storage':
          categorizedModules.storage.push(module);
          break;
        case 'monitoring':
          categorizedModules.monitoring.push(module);
          break;
        case 'documentation':
          categorizedModules.documentation.push(module);
          break;
        case 'communication':
          categorizedModules.communication.push(module);
          break;
        default:
          categorizedModules.other.push(module);
      }
    });

    return [
      {
        id: 'database',
        name: 'Database & Data',
        description: 'Database connections, ORM, and data management',
        icon: categoryIcons.database,
        color: categoryColors.database,
        modules: categorizedModules.database,
      },
      {
        id: 'authentication',
        name: 'Authentication & Users',
        description: 'User authentication, authorization, and OAuth',
        icon: categoryIcons.authentication,
        color: categoryColors.authentication,
        modules: categorizedModules.authentication,
      },
      {
        id: 'security',
        name: 'Security & Encryption',
        description: 'Security features, encryption, and protection',
        icon: categoryIcons.security,
        color: categoryColors.security,
        modules: categorizedModules.security,
      },
      {
        id: 'performance',
        name: 'Performance & Caching',
        description: 'Caching, optimization, and performance tools',
        icon: categoryIcons.performance,
        color: categoryColors.performance,
        modules: categorizedModules.performance,
      },
      {
        id: 'storage',
        name: 'File Storage & CDN',
        description: 'File storage, uploads, and content delivery',
        icon: categoryIcons.storage,
        color: categoryColors.storage,
        modules: categorizedModules.storage,
      },
      {
        id: 'monitoring',
        name: 'Monitoring & Logging',
        description: 'Logging, monitoring, metrics, and analytics',
        icon: categoryIcons.monitoring,
        color: categoryColors.monitoring,
        modules: categorizedModules.monitoring,
      },
      {
        id: 'configuration',
        name: 'Configuration & Tools',
        description: 'Configuration management and developer tools',
        icon: categoryIcons.configuration,
        color: categoryColors.configuration,
        modules: categorizedModules.configuration,
      },
      {
        id: 'documentation',
        name: 'Documentation & API',
        description: 'API documentation and development tools',
        icon: categoryIcons.documentation,
        color: categoryColors.documentation,
        modules: categorizedModules.documentation,
      },
      {
        id: 'communication',
        name: 'Communication & Notifications',
        description: 'Email, SMS, messaging, and notification services',
        icon: categoryIcons.other,
        color: categoryColors.other,
        modules: categorizedModules.communication,
      },
      {
        id: 'other',
        name: 'Other Features',
        description: 'Additional features and integrations',
        icon: categoryIcons.other,
        color: categoryColors.other,
        modules: categorizedModules.other,
      },
    ].filter(category => category.modules.length > 0);
  }, [modules]);

  const currentCategory = categories[currentStep];
  const totalSteps = categories.length;

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

  const getSelectedInCategory = (category: ModuleCategory) => {
    return category.modules.filter(module => selectedModules.includes(module.name)).length;
  };

  if (!currentCategory) {
    return (
      <div className="text-center text-zinc-400 py-8">
        No modules available for selection.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-zinc-50 tracking-tight">
              Select Modules
            </h2>
            <p className="text-zinc-400">
              Choose features step by step, organized by category
            </p>
          </div>
          <div className="text-sm text-zinc-400">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Category Overview */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const selectedCount = getSelectedInCategory(category);
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <button
                key={category.id}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                  isActive && 'bg-white/10 text-white border border-white/20',
                  !isActive && isCompleted && selectedCount > 0 && 'bg-green-500/20 text-green-400 border border-green-500/30',
                  !isActive && !isCompleted && 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300',
                  !isActive && isCompleted && selectedCount === 0 && 'bg-zinc-800/50 text-zinc-500'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="bg-white/20 text-white text-xs px-1 py-0">
                    {selectedCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Category */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Category Header */}
          <Card className="p-6 glass-card border-white/20 bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-start space-x-4">
              <div className={cn(
                'p-3 rounded-lg bg-gradient-to-r',
                currentCategory.color
              )}>
                <currentCategory.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-50 mb-1">
                  {currentCategory.name}
                </h3>
                <p className="text-zinc-400">
                  {currentCategory.description}
                </p>
                <p className="text-sm text-zinc-500 mt-2">
                  {currentCategory.modules.length} modules available
                </p>
              </div>
            </div>
          </Card>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCategory.modules.map((module, index) => {
              const isSelected = selectedModules.includes(module.name);
              const conflicts = getConflicts(module.name);
              const hasConflicts = conflicts.length > 0;

              return (
                <motion.div
                  key={module.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    className={cn(
                      'relative p-5 cursor-pointer transition-all duration-200 group glass-card',
                      'hover:border-zinc-700',
                      hasConflicts && 'border-red-500/50 bg-red-500/5',
                      isSelected && !hasConflicts && 'border-green-500/50 bg-green-500/5'
                    )}
                    onClick={() => !hasConflicts && handleModuleToggle(module.name)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        <Checkbox
                          checked={isSelected}
                          disabled={hasConflicts}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className={cn(
                            'h-4 w-4',
                            isSelected ? 'text-green-500' : 'text-zinc-400'
                          )} />
                          <h4 className="font-semibold text-zinc-50">
                            {module.name}
                          </h4>
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
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="text-xs font-medium text-green-500">
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
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
            currentStep === 0
              ? 'text-zinc-600 cursor-not-allowed'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="text-sm text-zinc-400">
          {selectedModules.length} modules selected
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
          disabled={currentStep === totalSteps - 1}
          className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200',
            currentStep === totalSteps - 1
              ? 'text-zinc-600 cursor-not-allowed'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          )}
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
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
            <Card className="p-4 glass-card border-green-500/20 bg-green-500/5">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-zinc-50">
                  Selected Modules ({selectedModules.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedModules.map((moduleName) => (
                  <Badge
                    key={moduleName}
                    variant="secondary"
                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
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