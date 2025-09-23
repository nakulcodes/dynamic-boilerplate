  import axios from 'axios';
import type { PresetInfo, GenerateRequest, GenerateResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced API response format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  path: string;
  statusCode: number;
}

export class ApiService {
  static async getPresets(): Promise<PresetInfo[]> {
    try {
      const response = await api.get<ApiResponse<PresetInfo[]>>('/presets');
      return response.data.data; // Extract data from enhanced response
    } catch (error) {
      console.error('Failed to fetch presets:', error);
      throw error;
    }
  }

  static async generateProject(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await api.post<ApiResponse<GenerateResponse>>('/generate', request);
      return response.data.data; // Extract data from enhanced response
    } catch (error) {
      console.error('Failed to generate project:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Generation failed');
      }
      throw error;
    }
  }

  static async getTaskStatus(taskId: string): Promise<GenerateResponse> {
    try {
      const response = await api.get<ApiResponse<GenerateResponse>>(`/task/${taskId}`);
      return response.data.data; // Extract data from enhanced response
    } catch (error) {
      console.error('Failed to get task status:', error);
      throw error;
    }
  }

  static async downloadProject(downloadUrl: string, fileName: string): Promise<void> {
    try {
      // For cross-origin downloads, we need to fetch the file and create a blob
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download project:', error);
      throw error;
    }
  }

  static async getProjectHistory(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<any> {
    try {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);

      const response = await api.get(`/project-history?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project history:', error);
      throw error;
    }
  }

  static async getProjectStats(): Promise<any> {
    try {
      const response = await api.get('/project-history/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project stats:', error);
      throw error;
    }
  }

  static async deleteProject(projectId: number): Promise<any> {
    try {
      const response = await api.delete(`/project-history/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  static async getProjectById(projectId: number): Promise<any> {
    try {
      const response = await api.get(`/project-history/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      throw error;
    }
  }
}