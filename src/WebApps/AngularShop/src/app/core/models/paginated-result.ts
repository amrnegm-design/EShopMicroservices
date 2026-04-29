export interface PaginatedResult<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface PaginationRequest {
  pageIndex?: number;
  pageSize?: number;
}
