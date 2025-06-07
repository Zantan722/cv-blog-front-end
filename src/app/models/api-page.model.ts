export interface Pageable<T = any> {
  total: number;
  skip: number;
  limit: number;
  list?: T[];
}