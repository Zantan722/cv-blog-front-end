import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; //  加入 ActivatedRoute
import { BlogService } from '../../../service/blog.service';
import { PublishStatus } from '../../../enums/publish-status.enum';
import { finalize } from 'rxjs';
import { NotificationService } from '../../../service/notification.service';
import { BlogModel } from '../../../models/blog.model';
import { BlogCreateComponent } from './blog-create.component';
import { ModifyBlogModel } from '../../../models/modify-blog.model';

@Component({
  selector: 'app-blog-modify',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './blog-modify.component.html',
  styleUrl: './blog-modify.component.css'
})
export class BlogModifyComponent extends BlogCreateComponent implements OnInit {
  protected override pageTitle: string = '編輯文章';

  //  編輯模式相關屬性
  blogId: number | null = null;
  originalBlog: BlogModel | null = null;

  protected route: ActivatedRoute = inject(ActivatedRoute) //  加入 ActivatedRoute

  constructor() {
    //  呼叫父類別的 constructor
    super();
    this.initForm();
  }

  protected override async onComponentInit(): Promise<void> {
    console.log('🖥️ BlogModifyComponent 開始初始化');

    // ✅ 先呼叫父類別的初始化
    await super.onComponentInit();

    // ✅ 然後執行編輯模式特有的初始化
    if (this.isBrowser) {
      await this.checkRouteAndLoadData();
    } else {
      console.log('🖥️ SSR 環境，跳過路由檢查');
    }
  }

  //  檢查路由並載入資料
  private checkRouteAndLoadData(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && !isNaN(Number(id))) {
      this.blogId = Number(id);
      console.log('📝 進入編輯模式，Blog ID:', this.blogId);
      this.loadBlogForEdit();
    } else {
      console.error('❌ 無效的 Blog ID');
      this.notificationService.error('無效的文章 ID');
      this.router.navigate(['/blog']);
    }
  }


  private validateUserPermission(blog: BlogModel): boolean {
    const currentUserId = this.getUserId(); // BaseComponent 提供
    const isCurrentUserAuthor = (blog as any).userId === currentUserId;

    // ✅ 管理員或文章作者可以編輯
    if (this.isAdmin() || isCurrentUserAuthor) { // BaseComponent 提供
      return true;
    }

    this.notificationService.error('您沒有權限編輯此文章');
    this.navigateTo(['/blog']); // BaseComponent 提供
    return false;
  }

  //  載入要編輯的 Blog 資料
  private loadBlogForEdit(): void {
    if (!this.blogId || !this.isBrowser) {
      return;
    }

    this.setIsLoading(true);

    this.blogService.getBlogDetail(this.blogId)
      .pipe(
        finalize(() => {
          this.setIsLoading(false);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('📖 載入編輯資料成功:', response);

          try {
            let blogData: BlogModel;

            if (response && typeof response === 'object' && 'data' in response) {
              blogData = (response as any).data;
            } else {
              blogData = response as any;
            }

            if (blogData) {
              if (!this.validateUserPermission(blogData)) {
                this.notificationService.error("該用戶無權編輯文章");
              }
              this.originalBlog = blogData;
              this.populateForm(blogData);
              console.log(' 表單資料已填入');
            } else {
              this.notificationService.error('找不到該文章');
              this.router.navigate(['/blog']);
            }

          } catch (error) {
            console.error('❌ 處理編輯資料失敗:', error);
            this.notificationService.error('載入文章資料失敗');
            this.router.navigate(['/blog']);
          }
        },

        error: (error) => {
          console.error('❌ 載入編輯資料失敗:', error);
          this.notificationService.error('載入文章失敗，請稍後再試');
          this.router.navigate(['/blog']);
        }
      });
  }

  private isOwnBlog(): boolean {
    return this.originalBlog?.userId === this.getUserId();
  }

  //  將 Blog 資料填入表單
  private populateForm(blog: BlogModel): void {
    // 填入基本欄位
    this.createForm.patchValue({
      title: blog.title || '',
      content: blog.content || '',
      status: this.mapStatusFromBlog(blog)
    });

    // 填入標籤
    const tagsArray = this.tagsArray;
    // 先清空現有標籤
    while (tagsArray.length > 0) {
      tagsArray.removeAt(0);
    }

    // 加入新標籤
    if (blog.tags && Array.isArray(blog.tags)) {
      blog.tags.forEach(tag => {
        if (typeof tag === 'string') {
          tagsArray.push(this.fb.control(tag));
        }
      });
    }

    // 標記表單為原始狀態
    this.createForm.markAsPristine();
  }

  //  轉換狀態格式
  private mapStatusFromBlog(blog: BlogModel): PublishStatus {
    if ((blog as any).status) {
      return (blog as any).status;
    }
    return PublishStatus.PUBLISHED;
  }

  //  覆寫提交方法，使用更新 API
  override onSubmit(): void {
    if (!this.isBrowser) {
      console.log('🖥️ SSR 環境，跳過表單提交');
      return;
    }

    this.createForm.markAllAsTouched();

    if (this.createForm.valid && this.blogId) {
      this.isSubmitting = true;

      const blogData: ModifyBlogModel = {
        title: this.createForm.get('title')?.value,
        content: this.createForm.get('content')?.value,
        tags: this.tags,
        status: this.createForm.get('status')?.value,
        id: this.blogId
      };

      console.log('📝 提交 Blog 更新資料:', blogData);

      this.blogService.updateBlog(!this.isOwnBlog(), blogData)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
          })
        )
        .subscribe({
          next: (response) => {
            console.log(' Blog 更新成功:', response);
            this.notificationService.success('文章更新成功！');
            this.router.navigate(['/blog/', this.blogId]);
          },
          error: (error) => {
            console.error('❌ Blog 更新失敗:', error);
            if (typeof error != 'boolean' && typeof error === 'object' && !error.message) {
              this.notificationService.error('更新文章失敗，請稍後再試');
            }
          }
        });
    } else {
      const firstError = this.getFirstFormError();
      if (firstError) {
        this.notificationService.warning(firstError);
      }
    }
  }

  private setIsLoading(loading: boolean) {
    this.isShowLoadingModal(loading)
    this.isLoading = loading;
    this.cdr.markForCheck;
  }

  //  覆寫重置方法
  override onReset(): void {
    if (!this.isBrowser) {
      return;
    }

    if (confirm('確定要重置為原始內容嗎？')) {
      if (this.originalBlog) {
        this.populateForm(this.originalBlog);
        this.tagInput = '';
        this.notificationService.info('表單已重置為原始內容');
      }
    }
  }

}