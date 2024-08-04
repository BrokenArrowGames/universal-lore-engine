export type FilterQuery<T, K extends keyof T> = {
  limit?: number;
  page?: number;
} & Partial<Pick<T, K>>;

export interface FilterRange {
  min: number;
  max: number;
  def: number;
}

export function filterProps<T, K extends keyof T>(
  query?: FilterQuery<T, K>,
  limit: FilterRange = { min: 0, max: 100, def: 10 },
) {
  if (!query) {
    return { skip: 0, take: limit.def };
  }

  query.limit = Math.min(
    Math.max(limit.min, query.limit ?? limit.def),
    limit.max,
  );
  query.page = Math.max(1, query.page ?? 1);
  return {
    skip: query.limit * (query.page - 1),
    take: query.limit,
  };
}
