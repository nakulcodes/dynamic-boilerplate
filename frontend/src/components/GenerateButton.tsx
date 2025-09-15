import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card border-zinc-800/50 overflow-hidden">
      {/* Environment Variables Section */}
      <AnimatePresence>
        {envRequired.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 border-b border-zinc-800/50"
          >
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <h4 className="text-sm font-semibold text-zinc-50">
                Required Environment Variables
              </h4>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {envRequired.map((env, index) => (
                <motion.div
                  key={env}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                  >
                    {env}
                  </Badge>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-zinc-400">
              These variables will be included in your generated project's <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs">.env.example</code> file
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Section */}
      <div className="p-6">
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

          <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: disabled || isGenerating ? 1 : 1.02 }}
          >
            <Button
              onClick={handleGenerate}
              disabled={disabled || isGenerating}
              size="lg"
              className={`
                relative overflow-hidden transition-all duration-300 font-semibold
                ${!disabled && !isGenerating
                  ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl'
                  : ''
                }
              `}
            >
              {/* Background animation */}
              {!disabled && !isGenerating && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
                  animate={{
                    x: [-100, 300],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}

              <div className="relative flex items-center space-x-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : disabled ? (
                  <>
                    <AlertCircle className="h-5 w-5" />
                    <span>Complete Configuration</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    <span>Generate Project</span>
                    <Download className="h-4 w-4 ml-1" />
                  </>
                )}
              </div>
            </Button>
          </motion.div>
        </div>

        {/* Status indicator */}
        <motion.div
          className="mt-4 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
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
        </motion.div>
      </div>
    </Card>
  );
};