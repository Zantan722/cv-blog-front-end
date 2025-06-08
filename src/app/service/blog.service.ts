import { SearchBlogModel } from '../models/search-blog.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { BlogModel } from '../models/blog.model';
import { Pageable } from '../models/api-page.model';
import { UserRole } from '../enums/user-role.enum';

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
    console.log(params);
    let url = '/common/blog';
    if (UserRole.ADMIN == query.userRole) {
      url = '/amin/blog';
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

}
