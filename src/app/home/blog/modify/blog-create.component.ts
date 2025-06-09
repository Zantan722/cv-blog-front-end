import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../service/blog.service';
import { NotificationService } from '../../../service/notification.service';
import { PublishStatus } from '../../../enums/publish-status.enum';
import { finalize } from 'rxjs';
import { CreateBlogModel } from '../../../models/modify-blog.model';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'app-blog-create',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './blog-modify.component.html',
  styleUrl: './blog-modify.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogCreateComponent extends BaseComponent implements OnInit {
  protected isBrowser: boolean;

  createForm!: FormGroup;
  protected isSubmitting = false;
  protected isLoading = false;

  protected pageTitle = '建立新文章'; // ✅ 讓子類別可以覆寫

  // 狀態選項
  statusOptions = [
    { value: PublishStatus.DRAFT, label: '草稿' },
    { value: PublishStatus.PUBLISHED, label: '發布' }
  ];

  // 標籤相關
  tagInput = '';

  constructor(
    protected fb: FormBuilder,
    protected route: ActivatedRoute,
    protected notificationService: NotificationService,
    protected blogService: BlogService,
    protected cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) {
    super();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  protected override async onComponentInit(): Promise<void> {
    console.log('🖥️ BlogCreateComponent 開始初始化');

    // ✅ 初始化表單
    this.initForm();

    if (this.isBrowser) {
      console.log('🖥️ 瀏覽器環境，Blog 建立頁面初始化完成');

      // ✅ 檢查用戶是否有權限建立文章
      if (!this.isLoggedIn) {
        console.log('❌ 用戶未登入，跳轉到登入頁');
        this.notificationService.warning('請先登入才能建立文章');
        this.goToLogin();
        return;
      }

      console.log('✅ 用戶已登入，可以建立文章:', this.getUserName());
    }
  }

  protected initForm(): void {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      tags: this.fb.array([]),
      status: [PublishStatus.DRAFT, [Validators.required]]
    });
  }

  protected setIsSubmit(submit: boolean) {
    this.isSubmitting = submit;
    this.cdr.markForCheck;
  }

  // 取得標籤 FormArray
  get tagsArray(): FormArray {
    return this.createForm.get('tags') as FormArray;
  }

  // 取得標籤值陣列
  get tags(): string[] {
    return this.tagsArray.value;
  }

  // 新增標籤
  addTag(): void {
    if (!this.isBrowser) {
      console.log('🖥️ SSR 環境，跳過標籤操作');
      return;
    }

    const trimmedTag = this.tagInput.trim();

    if (trimmedTag && !this.tags.includes(trimmedTag)) {
      if (this.tags.length >= 10) {
        this.notificationService.warning('最多只能新增 10 個標籤');
        return;
      }

      if (trimmedTag.length > 20) {
        this.notificationService.warning('標籤長度不能超過 20 個字符');
        return;
      }

      this.tagsArray.push(this.fb.control(trimmedTag));
      this.tagInput = '';
    } else if (this.tags.includes(trimmedTag)) {
      this.notificationService.warning('標籤已存在');
    }
  }

  // 移除標籤
  removeTag(index: number): void {
    if (!this.isBrowser) {
      console.log('🖥️ SSR 環境，跳過標籤操作');
      return;
    }

    this.tagsArray.removeAt(index);
  }

  // 處理標籤輸入的 Enter 鍵
  onTagKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  // 檢查欄位是否有錯誤且被觸碰過
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // 取得欄位錯誤訊息
  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return this.getRequiredMessage(fieldName);
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)}至少需要 ${minLength} 個字符`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)}不能超過 ${maxLength} 個字符`;
      }
    }
    return '';
  }

  protected getRequiredMessage(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'title': '請輸入文章標題',
      'content': '請輸入文章內容',
      'status': '請選擇發布狀態'
    };
    return labels[fieldName] || '此欄位為必填';
  }

  protected getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'title': '標題',
      'content': '內容',
      'status': '狀態'
    };
    return labels[fieldName] || fieldName;
  }

  // 儲存草稿
  saveDraft(): void {
    this.createForm.patchValue({ status: PublishStatus.DRAFT });
    this.onSubmit();
  }

  // 發布文章
  publish(): void {
    this.createForm.patchValue({ status: PublishStatus.PUBLISHED });
    this.onSubmit();
  }

  // 提交表單 (可被子類別覆寫)
  onSubmit(): void {
    if (!this.isBrowser) {
      console.log('🖥️ SSR 環境，跳過表單提交');
      return;
    }

    this.createForm.markAllAsTouched();

    if (this.createForm.valid) {
      this.setIsSubmit(true);

      const blogData: CreateBlogModel = {
        title: this.createForm.get('title')?.value,
        content: this.createForm.get('content')?.value,
        tags: this.tags,
        status: this.createForm.get('status')?.value
      };

      console.log('📝 提交 Blog 資料:', blogData);

      this.blogService.createBlog(blogData)
        .pipe(
          finalize(() => {
            this.setIsSubmit(false);
          })
        )
        .subscribe({
          next: (response) => {
            console.log('✅ Blog 建立成功:', response);

            const status = blogData.status === PublishStatus.PUBLISHED ? '發布' : '儲存為草稿';
            this.notificationService.success(`文章${status}成功！`);

            this.router.navigate(['/blog']);
          },
          error: (error) => {
            console.error('❌ Blog 建立失敗:', error);
            this.notificationService.error('建立文章失敗，請稍後再試');
          }
        });
    } else {
      const firstError = this.getFirstFormError();
      if (firstError) {
        this.notificationService.warning(firstError);
      }
    }
  }

  protected getFirstFormError(): string {
    const controls = this.createForm.controls;
    for (const controlName in controls) {
      const control = controls[controlName];
      if (control.invalid) {
        return this.getFieldError(controlName);
      }
    }
    return '';
  }

  // 重置表單 (可被子類別覆寫)
  onReset(): void {
    if (!this.isBrowser) {
      return;
    }

    if (confirm('確定要清除所有內容嗎？')) {
      this.createForm.reset();
      this.createForm.patchValue({ status: PublishStatus.DRAFT });
      this.tagInput = '';
      // 清空標籤陣列
      while (this.tagsArray.length > 0) {
        this.tagsArray.removeAt(0);
      }
      this.notificationService.info('表單已重置');
    }
  }

  // 返回列表
  goBack(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.createForm.dirty) {
      if (confirm('有未儲存的變更，確定要離開嗎？')) {
        this.router.navigate(['/blog']);
      }
    } else {
      this.router.navigate(['/blog']);
    }
  }
}