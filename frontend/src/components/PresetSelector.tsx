import React from 'react';
import type { PresetInfo } from '../types';

interface PresetSelectorProps {
  presets: PresetInfo[];
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  selectedPreset,
  onPresetChange,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Choose a Preset</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onPresetChange(preset.name)}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              selectedPreset === preset.name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-medium text-gray-900">{preset.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                {preset.modules.length} modules available
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};