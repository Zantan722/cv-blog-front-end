export interface BlogModel {
  id: number;
  title: string;
  author: string;
  createDate: number;
  updateDate: number;
  content?: string;
  tags:any;
}
