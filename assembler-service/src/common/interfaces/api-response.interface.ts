export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[] | Record<string, string[]>;
  timestamp: string;
  path: string;
  statusCode: number;
}

export interface ApiResponseOptions {
  message?: string;
  statusCode?: number;
}