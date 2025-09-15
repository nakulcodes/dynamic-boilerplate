import React, { useState, useEffect } from 'react';
import { PresetSelector } from './components/PresetSelector';
import { ModuleSelector } from './components/ModuleSelector';
import { ProjectConfig } from './components/ProjectConfig';
import { FileTreePreview } from './components/FileTreePreview';
import { GenerateButton } from './components/GenerateButton';
import { ApiService } from './services/api.service';
import type { PresetInfo, GenerateRequest } from './types';

function App() {
  const [presets, setPresets] = useState<PresetInfo[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [envRequired, setEnvRequired] = useState<string[]>([]);

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    if (selectedPreset) {
      // Calculate required environment variables based on selected modules
      const preset = presets.find(p => p.name === selectedPreset);
      if (preset) {
        const requiredEnvs = new Set<string>();

        selectedModules.forEach(moduleName => {
          // In a real implementation, you'd have env requirements in the module metadata
          if (moduleName === 'google-oauth') {
            requiredEnvs.add('GOOGLE_CLIENT_ID');
            requiredEnvs.add('GOOGLE_CLIENT_SECRET');
            requiredEnvs.add('GOOGLE_CALLBACK_URL');
          }
          if (moduleName === 'google-calendar') {
            requiredEnvs.add('GOOGLE_CLIENT_ID');
            requiredEnvs.add('GOOGLE_CLIENT_SECRET');
          }
          if (moduleName === 'enhanced-logging') {
            requiredEnvs.add('ELASTICSEARCH_URL');
            requiredEnvs.add('METRICS_ENABLED');
            requiredEnvs.add('METRICS_PORT');
          }
        });

        // Add base requirements
        requiredEnvs.add('DATABASE_URL');
        requiredEnvs.add('JWT_SECRET');

        setEnvRequired(Array.from(requiredEnvs));
      }
    }
  }, [selectedPreset, selectedModules, presets]);

  const loadPresets = async () => {
    try {
      const presetsData = await ApiService.getPresets();
      setPresets(presetsData);
      if (presetsData.length > 0) {
        setSelectedPreset(presetsData[0].name);
      }
    } catch (error) {
      alert('Failed to load presets');
      console.error('Failed to load presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    if (!selectedPreset) {
      alert('Please select a preset');
      return;
    }

    const request: GenerateRequest = {
      preset: selectedPreset,
      modules: selectedModules,
      projectName: projectName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      author: author.trim(),
      output: {
        type: 'zip',
      },
    };

    try {
      const result = await ApiService.generateProject(request);

      if (result.status === 'success' && result.outputUrl) {
        alert('Project generated successfully!');
        console.log('Generated project URL:', result.outputUrl);

        // Trigger download
        window.open(result.outputUrl, '_blank');
      } else if (result.status === 'error') {
        alert(result.error || 'Generation failed');
      }
    } catch (error) {
      alert('Failed to generate project');
      console.error('Generation error:', error);
    }
  };

  const currentPreset = presets.find(p => p.name === selectedPreset);
  const canGenerate = projectName.trim() && selectedPreset;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading presets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dynamic Boilerplate Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate ready-to-use project repositories from base presets and feature modules.
            Select your stack, choose your modules, and get started in seconds.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-8">
              {/* Preset Selection */}
              <PresetSelector
                presets={presets}
                selectedPreset={selectedPreset}
                onPresetChange={setSelectedPreset}
              />

              {/* Project Configuration */}
              <ProjectConfig
                projectName={projectName}
                author={author}
                onProjectNameChange={setProjectName}
                onAuthorChange={setAuthor}
              />

              {/* Module Selection */}
              {currentPreset && (
                <ModuleSelector
                  modules={currentPreset.modules}
                  selectedModules={selectedModules}
                  onModuleChange={setSelectedModules}
                />
              )}
            </div>

            {/* Preview Panel */}
            {/* <div className="lg:col-span-1"> */}
              {/* <div className="sticky top-8 space-y-6">
                <FileTreePreview
                  selectedPreset={selectedPreset}
                  selectedModules={selectedModules}
                />
              </div>
            </div> */}
          </div>

          {/* Generate Button */}
          <div className="mt-8 bg-white rounded-lg shadow-lg">
            <GenerateButton
              onGenerate={handleGenerate}
              disabled={!canGenerate}
              envRequired={envRequired}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
