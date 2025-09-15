import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PresetSelector } from "./components/PresetSelector";
import { ModuleSelector } from "./components/ModuleSelector";
import { ProjectConfig } from "./components/ProjectConfig";
import { FileTreePreview } from "./components/FileTreePreview";
import { GenerateButton } from "./components/GenerateButton";
import { ApiService } from "./services/api.service";
import type { PresetInfo, GenerateRequest } from "./types";
import { Loader2 } from "lucide-react";

function App() {
  const [presets, setPresets] = useState<PresetInfo[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [envRequired, setEnvRequired] = useState<string[]>([]);

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

      if (result.status === "success" && result.outputUrl) {
        alert("Project generated successfully!");
        console.log("Generated project URL:", result.outputUrl);

        // Trigger download
        window.open(result.outputUrl, "_blank");
      } else if (result.status === "error") {
        alert(result.error || "Generation failed");
      }
    } catch (error) {
      alert("Failed to generate project");
      console.error("Generation error:", error);
    }
  };

  const currentPreset = presets.find((p) => p.name === selectedPreset);
  const canGenerate = projectName.trim() && selectedPreset;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-zinc-400">Loading presets...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800/20 pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full glass border border-zinc-800/50">
              <span className="text-sm font-medium text-zinc-400">
                ✨ Modern Project Generator
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-zinc-50 mb-6 tracking-tight">
              Dynamic Boilerplate{" "}
              <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Generate production-ready repositories from base presets and
              feature modules.
              <br />
              Select your stack, choose your modules, and ship faster.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Configuration Panel */}
            <motion.div
              className="xl:col-span-8 space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <AnimatePresence mode="wait">
                {/* Preset Selection */}
                <motion.div
                  key="preset-selector"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PresetSelector
                    presets={presets}
                    selectedPreset={selectedPreset}
                    onPresetChange={setSelectedPreset}
                  />
                </motion.div>

                {/* Project Configuration */}
                <motion.div
                  key="project-config"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <ProjectConfig
                    projectName={projectName}
                    author={author}
                    onProjectNameChange={setProjectName}
                    onAuthorChange={setAuthor}
                  />
                </motion.div>

                {/* Module Selection */}
                {currentPreset && (
                  <motion.div
                    key="module-selector"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <ModuleSelector
                      modules={currentPreset.modules}
                      selectedModules={selectedModules}
                      onModuleChange={setSelectedModules}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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
                />
              </div>
            </motion.div>
          </div>

          {/* Generate Button */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GenerateButton
              onGenerate={handleGenerate}
              disabled={!canGenerate}
              envRequired={envRequired}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
