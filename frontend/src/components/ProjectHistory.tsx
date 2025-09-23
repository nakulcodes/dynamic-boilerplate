import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Download, Trash2, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { ApiService } from '../services/api.service';

interface ProjectHistoryItem {
  id: number;
  projectName: string;
  preset: string;
  modules: string[];
  author: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  fileName?: string;
  createdAt: string;
}

interface ProjectStats {
  totalProjects: number;
  completedProjects: number;
  failedProjects: number;
  recentProjects: ProjectHistoryItem[];
}

export function ProjectHistory() {
  const [projects, setProjects] = useState<ProjectHistoryItem[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProjectHistory();
    loadStats();
  }, [currentPage, searchTerm]);

  const loadProjectHistory = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getProjectHistory({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
      });

      if (response.success) {
        setProjects(response.data.projects);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load project history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ApiService.getProjectStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load project stats:', error);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project from your history?')) {
      return;
    }

    try {
      await ApiService.deleteProject(projectId);
      loadProjectHistory();
      loadStats();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'generating':
        return 'text-yellow-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-foreground mx-auto" />
          <p className="text-muted-foreground mt-2">Loading project history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Projects</h3>
            <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
            <p className="text-2xl font-bold text-green-400">{stats.completedProjects}</p>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Failed</h3>
            <p className="text-2xl font-bold text-red-400">{stats.failedProjects}</p>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder-muted-foreground"
        />
      </motion.div>

      {/* Project List */}
      <AnimatePresence mode="wait">
        {projects.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No projects found</p>
          </motion.div>
        ) : (
          <motion.div
            key="projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {project.projectName}
                      </h3>
                      <div className={`flex items-center gap-1 ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="text-sm capitalize">{project.status}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Preset:</strong> {project.preset}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Modules:</strong> {project.modules.join(', ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Author:</strong> {project.author}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {project.status === 'completed' && project.downloadUrl && (
                      <button
                        onClick={() => window.open(project.downloadUrl, '_blank')}
                        className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
                        title="Download or view project"
                      >
                        {project.downloadUrl.includes('github.com') ? (
                          <ExternalLink className="h-4 w-4" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-2"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                page === currentPage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-accent text-secondary-foreground'
              }`}
            >
              {page}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}