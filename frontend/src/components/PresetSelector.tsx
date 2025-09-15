import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-50 tracking-tight">
          Choose a Preset
        </h2>
        <p className="text-zinc-400">
          Select the foundation technology stack for your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presets.map((preset, index) => (
          <motion.div
            key={preset.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                'relative p-6 cursor-pointer transition-all duration-200 border-zinc-800/50 hover:border-zinc-800 group',
                'glass-card',
                selectedPreset === preset.name &&
                'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 border-white/50'
              )}
              onClick={() => onPresetChange(preset.name)}
            >
              {/* Selection indicator */}
              {selectedPreset === preset.name && (
                <motion.div
                  className="absolute -top-2 -right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.3 }}
                >
                  <div className="bg-white rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4 text-zinc-950" />
                  </div>
                </motion.div>
              )}

              {/* Preset icon and name */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'p-2 rounded-lg transition-colors',
                    selectedPreset === preset.name
                      ? 'bg-white/10 text-white'
                      : 'bg-zinc-800 text-zinc-400 group-hover:bg-white/5 group-hover:text-white'
                  )}>
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-50 text-lg">
                      {preset.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                {preset.description}
              </p>

              {/* Module count badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors"
                >
                  {preset.modules.length} modules available
                </Badge>

                {selectedPreset === preset.name && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-medium text-white"
                  >
                    Selected
                  </motion.div>
                )}
              </div>

              {/* Hover effect gradient */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};