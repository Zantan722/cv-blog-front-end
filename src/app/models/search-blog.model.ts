import { BlogOrderBy } from "../enums/blog-orderby.enum";
import { Sort } from "../enums/sort.enum";

export interface SearchBlogModel {
    id: number;
    title: string;
    authorName?: string,
    orderBy: BlogOrderBy;
    sort: Sort;
    skip: number;
    limit: number;
    dateFrom?: number | null;
    dateTo?: number | null;
}