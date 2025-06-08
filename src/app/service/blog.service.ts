import { SearchBlogModel } from '../models/search-blog.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { BlogModel } from '../models/blog.model';
import { Pageable } from '../models/api-page.model';
import { UserRole } from '../enums/user-role.enum';
import { CreateBlogModel, ModifyBlogModel } from '../models/modify-blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private http: HttpClient) { }

  searchBlog(query: SearchBlogModel): Observable<ApiResponse<Pageable<BlogModel>>> {
    let params = new HttpParams();
    console.log(query);
    if (query.id) {
      params = params.set('id', query.id);
    }
    if (query.title !== undefined && query.title) {
      params = params.set('title', query.title.toString());
    }
    if (query.orderBy !== undefined) {
      params = params.set('orderBy', query.orderBy.toString());
    }
    if (query.sort) {
      params = params.set('sort', query.sort);
    }
    if (query.sort) {
      params = params.set('skip', query.skip);
    }
    if (query.sort) {
      params = params.set('limit', query.limit);
    }
    if (query.dateFrom != null) {
      params = params.set('dateFrom', query.dateFrom);
    }
    if (query.dateTo != null) {
      params = params.set('dateTo', query.dateTo);
    }
    if (query.authorName != null) {
      params = params.set('authorName', query.authorName);
    }
    if (query.containDeleted != null) {
      params = params.set('containDeleted', query.containDeleted);
    }
    console.log(params);
    let url = '/common/blog';
    if (UserRole.ADMIN == query.userRole) {
      url = '/admin/blog';
    } else if (UserRole.USER == query.userRole) {
      url = '/user/blog';
    }
    return this.http.get<ApiResponse<Pageable<BlogModel>>>(url, {
      params: params
    });
  }


  getBlogDetail(id: number): Observable<ApiResponse<BlogModel>> {
    return this.http.get<ApiResponse<BlogModel>>(`/common/blog/${id}`);
  }


  createBlog(blogData: CreateBlogModel): Observable<ApiResponse<BlogModel>> {
    return this.http.post<ApiResponse<BlogModel>>(`/user/blog`, blogData);

  }

  updateBlog(isAdmin: boolean, blogData: ModifyBlogModel): Observable<ApiResponse<BlogModel>> {
    console.log('📝 更新 Blog API 呼叫:', blogData.id, blogData);
    let url = `/user/blog`;
    if (isAdmin) {
      url = `/admin/blog`;
    }
    return this.http.patch<ApiResponse<BlogModel>>(url, blogData);
  }

  deleteBlog(id: number, isAdmin: boolean): Observable<ApiResponse<boolean>> {
    console.log('🗑️ 刪除 Blog API 呼叫:', id);
    let url = `/user/blog/${id}`;
    if (isAdmin) {
      url = `/admin/blog/${id}`;
    }
    return this.http.delete<ApiResponse<boolean>>(url);
  }
}
