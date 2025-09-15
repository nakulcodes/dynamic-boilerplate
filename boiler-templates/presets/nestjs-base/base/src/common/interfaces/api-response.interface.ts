/**
 * Generic interface for standardized API responses
 * All API responses should follow this structure
 */
export interface ApiResponse<T = any> {
  /**
   * The actual response data
   * - For single items: T (object)
   * - For lists: T[] (array)
   */
  payload: T;

  /**
   * Optional metadata for the response
   * For non-paginated responses, can include timestamps, additional info, etc.
   */
  meta?: Record<string, any>;
}

/**
 * Generic interface for paginated API responses
 * Used when returning lists of items with pagination
 */
export interface PaginatedApiResponse<T = any> {
  /**
   * Array of items for the current page
   */
  payload: T[];

  /**
   * Pagination metadata
   */
  meta: PaginationMetaData;
}

/**
 * Pagination metadata interface
 * Contains information about the current page, total items, etc.
 */
export interface PaginationMetaData {
  /**
   * Current page number (1-based)
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Total number of items across all pages
   */
  total: number;

  /**
   * Total number of pages
   * Calculated as Math.ceil(total / limit)
   */
  totalPages?: number;

  /**
   * Whether there is a next page
   */
  hasNext?: boolean;

  /**
   * Whether there is a previous page
   */
  hasPrevious?: boolean;
}

/**
 * Optional metadata for non-paginated responses
 */
export interface ResponseMetaData {
  /**
   * Timestamp when the response was generated
   */
  timestamp?: string;

  /**
   * Additional context or information
   */
  [key: string]: any;
}

/**
 * Legacy interface - kept for backward compatibility
 * @deprecated Use ApiResponse<T> instead
 */
export interface LegacyApiResponse<T = any> {
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