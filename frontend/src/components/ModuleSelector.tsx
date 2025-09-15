import React from 'react';
import type { ModuleInfo } from '../types';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Select Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => {
          const isSelected = selectedModules.includes(module.name);
          const conflicts = getConflicts(module.name);
          const hasConflicts = conflicts.length > 0;

          return (
            <div
              key={module.name}
              className={`border rounded-lg p-4 ${
                hasConflicts ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleModuleToggle(module.name)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={hasConflicts}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{module.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    </div>
                  </label>

                  {hasConflicts && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      <span>Conflicts with: {conflicts.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedModules.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Selected modules: {selectedModules.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};