export interface BlogModel {
  id: number;
  title: string;
  author: string;
  userId: number,
  createDate: number;
  updateDate: number;
  content?: string;
  status?: string;
  tags:any;
  deleted:boolean;
}
