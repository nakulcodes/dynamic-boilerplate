import React from 'react';

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
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Project Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name *
          </label>
          <input
            id="project-name"
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="my-awesome-project"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Use lowercase letters, numbers, and hyphens only
          </p>
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
            Author
          </label>
          <input
            id="author"
            type="text"
            value={author}
            onChange={(e) => onAuthorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your Name"
          />
        </div>
      </div>
    </div>
  );
};