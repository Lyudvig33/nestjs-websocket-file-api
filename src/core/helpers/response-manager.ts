import { round } from 'lodash';

export class ResponseManager {
  static generateMetaResponse(
    offset: number,
    limit: number,
    totalCount: number,
  ) {
    const pageCount = Math.ceil(totalCount / limit);
    const currentPage = round(offset / limit + 1);

    return {
      limit: limit,
      total: totalCount,
      offset: offset,
      currentPage: currentPage,
      hasPrev: currentPage > 1 || Boolean(offset),
      hasNext: currentPage < pageCount,
      pageCount: pageCount,
    };
  }
}
