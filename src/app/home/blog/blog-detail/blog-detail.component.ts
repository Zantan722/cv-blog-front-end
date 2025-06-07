// src/app/blog-detail/blog-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { BlogModel } from '../../../models/blog.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../service/blog.service';
import { ApiResponse } from '../../../models/api-response.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-detail',
  imports: [CommonModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent implements OnInit { // ✅ 加入 OnInit

  blog: BlogModel | null = null;
  isLoading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.loadBlogDetail();
  }

  private loadBlogDetail(): void {
    const blogId = this.route.snapshot.paramMap.get('id');
    console.log("123123");
    console.log(blogId);
    if (!blogId || isNaN(Number(blogId))) {
      this.error = '無效的部落格 ID';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.blogService.getBlogDetail(Number(blogId)).subscribe({
      next: (response) => {
        console.log('📖 獲取部落格詳情:', response);
        
        try {
          let blogData: any;
          
          if (response && typeof response === 'object' && 'data' in response) {
            // ApiResponse 格式
            const apiResponse = response as ApiResponse<any>;
            blogData = apiResponse.data!;
          } else {
            // 直接是 BlogModel
            blogData = response;
          }
          
          if (blogData) {
            this.blog = this.formatBlogData(blogData);
            console.log('✅ 部落格資料載入完成:', this.blog);
          } else {
            this.error = '找不到該部落格';
          }
          
        } catch (error) {
          console.error('❌ 處理部落格資料失敗:', error);
          this.error = '載入部落格資料時發生錯誤';
        }
        
        this.isLoading = false;
      },
      
      error: (error) => {
        console.error('❌ 獲取部落格詳情失敗:', error);
        this.error = '載入部落格失敗，請稍後再試';
        this.isLoading = false;
      }
    });
  }

  private formatBlogData(blog: any): BlogModel {
    return {
      id: blog.id || 0,
      title: blog.title || '無標題',
      content: blog.content || '',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      createDate: blog.createDate,
      updateDate: blog.updateDate,
      author: blog.author || '未知作者'
    };
  }

  // ✅ 將方法設為 public，讓模板可以使用
  formatDateTime(dateTime: string | number | Date): string {
    if (!dateTime) return '';
    
    let date: Date;
    
    if (typeof dateTime === 'number') {
      date = new Date(dateTime);
    } else if (typeof dateTime === 'string') {
      date = new Date(dateTime);
    } else {
      date = dateTime;
    }
    
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }

  editBlog(): void {
    if (this.blog) {
      this.router.navigate(['/blog/edit', this.blog.id]);
    }
  }
}