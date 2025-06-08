import { PublishStatus } from '../enums/publish-status.enum';

export interface CreateBlogModel {
  title: string;
  content: string;
  tags?: string[];
  status: PublishStatus;
}


export interface ModifyBlogModel extends CreateBlogModel{
  id: number;
}