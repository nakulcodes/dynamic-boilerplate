import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PresetSelector } from "./PresetSelector";
import { SteppedModuleSelector } from "./SteppedModuleSelector";
import { ProjectConfig } from "./ProjectConfig";
import { FileTreePreview } from "./FileTreePreview";
import { GenerateButton } from "./GenerateButton";
import { ApiService } from "../services/api.service";
import type { PresetInfo, GenerateRequest } from "../types";
import { Loader2, LogOut, History, Zap } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { ProjectHistory } from './ProjectHistory';

export function MainContent() {
  const { user, logout } = useAuth();
  const [presets, setPresets] = useState<PresetInfo[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [author, setAuthor] = useState<string>(user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || "");
  const [loading, setLoading] = useState<boolean>(true);
  const [envRequired, setEnvRequired] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    if (selectedPreset) {
      // Calculate required environment variables based on selected modules
      const preset = presets.find((p) => p.name === selectedPreset);
      if (preset) {
        const requiredEnvs = new Set<string>();

        selectedModules.forEach((moduleName) => {
          // In a real implementation, you'd have env requirements in the module metadata
          if (moduleName === "google-oauth") {
            requiredEnvs.add("GOOGLE_CLIENT_ID");
            requiredEnvs.add("GOOGLE_CLIENT_SECRET");
            requiredEnvs.add("GOOGLE_CALLBACK_URL");
          }
          if (moduleName === "google-calendar") {
            requiredEnvs.add("GOOGLE_CLIENT_ID");
            requiredEnvs.add("GOOGLE_CLIENT_SECRET");
          }
          if (moduleName === "enhanced-logging") {
            requiredEnvs.add("ELASTICSEARCH_URL");
            requiredEnvs.add("METRICS_ENABLED");
            requiredEnvs.add("METRICS_PORT");
          }
        });

        // Add base requirements
        requiredEnvs.add("DATABASE_URL");
        requiredEnvs.add("JWT_SECRET");

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
      alert("Failed to load presets");
      console.error("Failed to load presets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    if (!selectedPreset) {
      alert("Please select a preset");
      return;
    }

    const request: GenerateRequest = {
      preset: selectedPreset,
      modules: selectedModules,
      projectName: projectName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-"),
      author: author.trim(),
      output: {
        type: "zip",
      },
    };

    try {
      const result = await ApiService.generateProject(request);

      if (result.status === 'success') {
        alert('Project generated successfully! Download will start automatically.');
        console.log('Generated project result:', result);

        // Use the downloadUrl and fileName from the response
        if (result.downloadUrl && result.fileName) {
          await ApiService.downloadProject(result.downloadUrl, result.fileName);
        } else if (result.outputUrl) {
          // Fallback to old method if new fields not available
          window.open(result.outputUrl, '_blank');
        }
      } else if (result.status === 'error') {
        alert(result.error || 'Generation failed');
      }
    } catch (error) {
      alert("Failed to generate project");
      console.error("Generation error:", error);
    }
  };

  const currentPreset = presets.find((p) => p.name === selectedPreset);
  const canGenerate = useMemo(() => {
    const result = Boolean(projectName && projectName.trim() && selectedPreset);
    console.log('canGenerate:', result, { projectName, selectedPreset });
    return result;
  }, [projectName, selectedPreset]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          </div>
          <p className="text-muted-foreground">Loading presets...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/20 pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        {/* User info and logout */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border rounded-lg px-4 py-2">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="text-sm">
                <div className="text-foreground">{user.firstName} {user.lastName}</div>
                <div className="text-muted-foreground text-xs">{user.email}</div>
              </div>
              <button
                onClick={logout}
                className="ml-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full glass border border-border/50">
              <span className="text-sm font-medium text-muted-foreground">
                ✨ Modern Project Generator
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Dynamic Boilerplate{" "}
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Generator
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Generate production-ready repositories from base presets and
              feature modules.
              <br />
              Select your stack, choose your modules, and ship faster.
            </p>

            {/* Tab Navigation */}
            <motion.div
              className="flex justify-center mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'generator'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  Generator
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <History className="h-4 w-4" />
                  Project History
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'generator' ? (
              <motion.div
                key="generator"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Configuration Panel */}
            <motion.div
              className="xl:col-span-8 space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
                {/* Preset Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PresetSelector
                    presets={presets}
                    selectedPreset={selectedPreset}
                    onPresetChange={setSelectedPreset}
                  />
                </motion.div>

                {/* Module Selection */}
                {currentPreset && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <SteppedModuleSelector
                      modules={currentPreset.modules}
                      selectedModules={selectedModules}
                      onModuleChange={setSelectedModules}
                    />
                  </motion.div>
                )}

                {/* Project Configuration - Show after modules are selected */}
                {selectedModules.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <ProjectConfig
                      projectName={projectName}
                      author={author}
                      onProjectNameChange={setProjectName}
                      onAuthorChange={setAuthor}
                    />
                  </motion.div>
                )}

                {/* Generate Button - Show after project config */}
                {selectedModules.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <GenerateButton
                      onGenerate={handleGenerate}
                      disabled={!canGenerate}
                      envRequired={envRequired}
                    />
                  </motion.div>
                )}
            </motion.div>

            {/* Preview Panel */}
            <motion.div
              className="xl:col-span-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="sticky top-8 space-y-6">
                <FileTreePreview
                  selectedPreset={selectedPreset}
                  selectedModules={selectedModules}
                  modules={currentPreset?.modules || []}
                />
              </div>
            </motion.div>
          </div>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectHistory />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}