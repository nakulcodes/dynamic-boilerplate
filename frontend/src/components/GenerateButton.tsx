import React, { useState } from 'react';
import { CloudArrowDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
    <div className="bg-white border-t border-gray-200 p-6">
      {envRequired.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-medium text-amber-800 mb-2">
            Required Environment Variables:
          </h4>
          <div className="flex flex-wrap gap-2">
            {envRequired.map((env) => (
              <code key={env} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">
                {env}
              </code>
            ))}
          </div>
          <p className="text-xs text-amber-700 mt-2">
            These will be listed in your generated project's .env.example file
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Ready to generate your project
        </div>
        <button
          onClick={handleGenerate}
          disabled={disabled || isGenerating}
          className={`
            flex items-center px-6 py-3 rounded-lg font-medium transition-all
            ${
              disabled || isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isGenerating ? (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <CloudArrowDownIcon className="h-5 w-5 mr-2" />
              Generate Project
            </>
          )}
        </button>
      </div>
    </div>
  );
};