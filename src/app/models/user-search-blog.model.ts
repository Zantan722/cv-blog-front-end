import { PublishStatus } from "../enums/publish-status.enum";
import { SearchBlogModel } from "./search-blog.model";

export interface UserSearchBlogModel extends SearchBlogModel{
    status: PublishStatus;
    
}