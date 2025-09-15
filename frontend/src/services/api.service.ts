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
}