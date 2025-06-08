import { BlogOrderBy } from "../enums/blog-orderby.enum";
import { Sort } from "../enums/sort.enum";
import { UserRole } from "../enums/user-role.enum";

export interface SearchBlogModel {
    id: number;
    title: string;
    authorName?: string,
    userId?: number,
    orderBy: BlogOrderBy;
    sort: Sort;
    skip: number;
    limit: number;
    dateFrom?: number | null;
    dateTo?: number | null;
    userRole?: UserRole | null;
    containDeleted?: boolean | null;
}