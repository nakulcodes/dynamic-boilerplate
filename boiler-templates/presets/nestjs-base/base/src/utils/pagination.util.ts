import { PaginationQuery, PaginatedResult, PaginationMeta } from '@interfaces/pagination.interface';

export class PaginationUtil {
  /**
   * Creates pagination metadata
   */
  static createMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Creates a paginated result
   */
  static createResult<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedResult<T> {
    const meta = this.createMeta(page, limit, total);

    return {
      data,
      meta,
    };
  }

  /**
   * Validates and normalizes pagination query parameters
   */
  static validateQuery(query: PaginationQuery): {
    page: number;
    limit: number;
    skip: number;
    sortBy?: string;
    sortOrder: 'ASC' | 'DESC';
    search?: string;
  } {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    return {
      page,
      limit,
      skip,
      sortBy: query.sortBy,
      sortOrder,
      search: query.search?.trim(),
    };
  }

  /**
   * Creates TypeORM find options for pagination
   */
  static createFindOptions(query: PaginationQuery): {
    take: number;
    skip: number;
    order?: Record<string, 'ASC' | 'DESC'>;
  } {
    const { limit, skip, sortBy, sortOrder } = this.validateQuery(query);

    const options: any = {
      take: limit,
      skip,
    };

    if (sortBy) {
      options.order = { [sortBy]: sortOrder };
    }

    return options;
  }
}