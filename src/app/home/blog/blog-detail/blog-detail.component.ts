import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { BlogModel } from '../../../models/blog.model';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../service/blog.service';
import { ApiResponse } from '../../../models/api-response.model';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-blog-detail',
  imports: [CommonModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogDetailComponent extends BaseComponent implements OnInit { // ✅ 加入 OnInit

  blog: BlogModel | null = null;
  isLoading = false;
  error = '';
  canEdit = false;

  private route: ActivatedRoute = inject(ActivatedRoute);
  private blogService: BlogService = inject(BlogService);
  protected cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    super();
  }

  protected override async onComponentInit(): Promise<void> {
    console.log('🖥️ BlogCreateComponent 開始初始化');

    this.loadBlogDetail();
  }

  private formatContentWithLineBreaks(content: string): string {
    if (!content) return '';
    return content.replace(/\n/g, '<br>');
  }

  private loadBlogDetail(): void {
    const blogId = this.route.snapshot.paramMap.get('id');
    if (!blogId || isNaN(Number(blogId))) {
      this.error = '無效的部落格 ID';
      return;
    }

    this.updateIsLoading(true);
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
            this.validateUser();
            console.log('✅ 部落格資料載入完成:', this.blog);
          } else {
            this.error = '找不到該部落格';
          }

        } catch (error) {
          console.error('❌ 處理部落格資料失敗:', error);
          this.error = '載入部落格資料時發生錯誤';
        }

        this.updateIsLoading(false);
      },

      error: (error) => {
        console.error('❌ 獲取部落格詳情失敗:', error);
        this.error = '載入部落格失敗，請稍後再試';
        this.updateIsLoading(false);
      }
    });
  }

  private updateIsLoading(loading: boolean) {
    this.isShowLoadingModal(loading);
    this.isLoading = loading;
    this.cdr.markForCheck();
  }

  private formatBlogData(blog: any): BlogModel {
    return {
      id: blog.id || 0,
      title: blog.title || '無標題',
      content: this.formatContentWithLineBreaks(blog.content || ''),
      tags: Array.isArray(blog.tags) ? [...blog.tags] : [],
      createDate: blog.createDate,
      updateDate: blog.updateDate,
      author: blog.author || '未知作者',
      userId: blog.userId,
      deleted: blog.deleted
    };
  }

  private validateUser() {
    console.log(this.getUserId());
    console.log(this.userId);
    console.log(this.getUserId() == this.userId)
    if (this.isAdmin() || this.getUserId() == this.blog?.userId) {
      this.canEdit = true;
    } else {
      this.canEdit = false;
    }
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

  private isOwnBlog(): boolean {
    return this.blog?.userId === this.getUserId();
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }

  editBlog(): void {
    if (this.blog) {
      this.router.navigate(['/blog/edit', this.blog.id]);
    }
  }

  confirmDeleteBlog(): void {
    this.notificationService.confirm("是否刪除該Blog文章", "注意", async () => {
      this.deleteBlog();
    },
      () => { });
  }

  deleteBlog(): void {
    if (this.blog) {
      this.blogService.deleteBlog(this.blog.id, !this.isOwnBlog())
        .pipe(
          finalize(() => {
            this.cdr.markForCheck();
          })

        )
        .subscribe({
          next: (response) => {
            console.log(' Blog 刪除成功:', response);
            window.history.back();
          },
          error: (error) => {
            console.error('❌ Blog 刪除失敗:', error);
            if (typeof error != 'boolean' && typeof error === 'object' && !error.message) {
              this.notificationService.error('刪除文章失敗，請稍後再試');
            }
          }
        });

    }
  }
}