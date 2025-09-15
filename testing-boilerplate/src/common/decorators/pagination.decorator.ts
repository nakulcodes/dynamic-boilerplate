import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationQuery } from '@interfaces/pagination.interface';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationQuery => {
    const request = ctx.switchToHttp().getRequest();
    const { page, limit, sortBy, sortOrder, search } = request.query;

    return {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC',
      search,
    };
  },
);