import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings2, User } from 'lucide-react';

interface ProjectConfigProps {
  projectName: string;
  author: string;
  onProjectNameChange: (name: string) => void;
  onAuthorChange: (author: string) => void;
}

export const ProjectConfig: React.FC<ProjectConfigProps> = ({
  projectName,
  author,
  onProjectNameChange,
  onAuthorChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Settings2 className="h-5 w-5 text-zinc-400" />
          <h2 className="text-2xl font-semibold text-zinc-50 tracking-tight">
            Project Configuration
          </h2>
        </div>
        <p className="text-zinc-400">
          Configure your project details and settings
        </p>
      </div>

      <Card className="p-6 glass-card border-zinc-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium text-zinc-50">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                className="w-full bg-zinc-950/50 border-zinc-800/50 focus:border-white focus:ring-1 focus:ring-white/20 transition-all"
                placeholder="my-awesome-project"
                required
              />
            </div>
            <p className="text-xs text-zinc-400">
              Use lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author" className="text-sm font-medium text-zinc-50">
              Author
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <User className="h-4 w-4 text-zinc-400" />
              </div>
              <Input
                id="author"
                type="text"
                value={author}
                onChange={(e) => onAuthorChange(e.target.value)}
                className="w-full pl-10 bg-zinc-950/50 border-zinc-800/50 focus:border-white focus:ring-1 focus:ring-white/20 transition-all"
                placeholder="Your Name"
              />
            </div>
            <p className="text-xs text-zinc-400">
              Optional: Your name for package.json author field
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};