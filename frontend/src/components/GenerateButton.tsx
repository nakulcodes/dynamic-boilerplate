import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import {
  Download,
  Loader2,
  Rocket,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Code2
} from 'lucide-react';

interface GenerateButtonProps {
  onGenerate: () => Promise<void>;
  disabled: boolean;
  envRequired: string[];
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  onGenerate,
  disabled,
  envRequired,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  console.log('GenerateButton render:', { disabled, envRequired, isGenerating });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Environment Variables Section */}
      {envRequired.length > 0 && (
        <Card className="glass-card border-zinc-800/50 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <h4 className="text-sm font-semibold text-zinc-50">
              Required Environment Variables
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {envRequired.map((env) => (
              <Badge
                key={env}
                variant="secondary"
                className="font-mono text-xs bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
              >
                {env}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-zinc-400">
            These variables will be included in your generated project's <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs">.env.example</code> file
          </p>
        </Card>
      )}

      {/* Generate Button Section */}
      <Card className="glass-card border-zinc-800/50 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Code2 className="h-5 w-5 text-white" />
              <span className="font-semibold text-zinc-50">Ready to Generate</span>
            </div>
            <p className="text-sm text-zinc-400">
              Your project will be assembled and downloaded as a ZIP file
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={disabled || isGenerating}
            className={`
              px-6 py-3 rounded-lg font-semibold text-sm
              flex items-center space-x-2
              transition-all duration-200
              ${disabled || isGenerating
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed opacity-50'
                : 'bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : disabled ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Complete Configuration</span>
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                <span>Generate Project</span>
                <Download className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Status indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            {disabled ? (
              <>
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                <span>Please complete the project configuration</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Configuration complete - ready to generate</span>
                <Sparkles className="h-3 w-3 text-white animate-pulse" />
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};