import { SearchBlogModel } from '../../models/search-blog.model';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogModel } from '../../models/blog.model';
import { BlogService } from '../../service/blog.service';
import { BlogOrderBy } from '../../enums/blog-orderby.enum';
import { Sort } from '../../enums/sort.enum';
import { ApiResponse } from '../../models/api-response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Pageable } from '../../models/api-page.model';
import { finalize } from 'rxjs';
import { BaseComponent } from '../base/base.component';
import { getPublishStatusDisplayName } from '../../enums/publish-status.enum';


// Blog 模型

@Component({
  selector: 'app-blog',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class BlogComponent extends BaseComponent implements OnInit {

  searchForm: FormGroup;
  blogs: BlogModel[] = [];
  paginatedBlogs: BlogModel[] = [];
  isLoading = false;


  // 頁面判斷
  protected isAdminSearchPage: boolean = false;
  protected isUserSearchPage = false;
  protected pageTile = 'Blog 查詢系統';

  // 分頁相關屬性
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  pageSizeOptions = [10, 20, 50, 100];

  // TrackBy 函數
  trackByBlogId = (index: number, blog: BlogModel) => blog.id;

  private fb = inject(FormBuilder);
  private blogService = inject(BlogService);
  protected cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  constructor() {
    super();
    this.searchForm = this.fb.group({
      id: [''],
      title: [''],
      author: ['', [Validators.minLength(2)]],
      startDate: [''],
      endDate: ['']
    });
  }

  protected override async onComponentInit(): Promise<void> {
    this.onSearch();
    this.searchForm.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  setIsLoading(loading: boolean) {
    this.isShowLoadingModal(loading);
    this.isLoading = loading;
    this.cdr.markForCheck;
  }


  // 搜尋功能
  onSearch(): void {
    this.setIsLoading(true);
    const formValue = this.searchForm.value;
    const criteria = this.generateCriteria(formValue);
    this.cdr.markForCheck();

    this.blogService.searchBlog(criteria)
      .pipe(
        finalize(() => {
          // ✅ 無論成功或失敗都會執行
          this.setIsLoading(false);
          this.updatePagination();
          console.log('🏁 請求完成，載入狀態已關閉');
        })
      )
      .subscribe({
        next: (response) => {
          console.log('登入成功，收到回應:', response);
          try {
            // 檢查是否是 ApiResponse 格式
            if (response && typeof response === 'object' && 'data' in response) {
              const apiResponse = response as ApiResponse<Pageable<BlogModel>>;
              const pageData = apiResponse.data;


              if (pageData && pageData.list) {
                this.blogs = [...pageData.list];
                this.totalItems = pageData.total;
              } else {
                console.error('❌ ApiResponse 中沒有有效的分頁資料');
                this.blogs = [];
                this.totalItems = 0;
              }
            } else {
              // 直接是 Pageable 格式
              const pageData = response as unknown as Pageable<BlogModel>;

              if (pageData && pageData.list) {
                this.blogs = [...pageData.list];
                this.totalItems = pageData.total;
              } else {
                console.error('❌ 分頁資料格式不正確');
                this.blogs = [];
                this.totalItems = 0;
              }
              this.cdr.markForCheck();
            }
          } catch (error) {
            console.error('❌ 處理回應時發生錯誤:', error);
            this.blogs = [];
            this.totalItems = 0;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('查詢失敗:', error);
          this.currentPage = 1;
          try {
            const errorData = error.error as ApiResponse;
            if (errorData.message) {
              this.notificationService.error(errorData.message);
            } else {
              this.notificationService.warning('查詢失敗,請確認是否登入');
            }
          } catch (e) {
            this.notificationService.error('查詢失敗');
            this.router
          }
        }
      });


  }

  protected generateCriteria(formValue: any) {
    let startDate: number | null = null;
    let endDate: number | null = null;
    console.log("表單資料:" + formValue.startDate)
    if (formValue.startDate != null && formValue.startDate != '') {
      startDate = new Date(formValue.startDate).getTime();
    }
    if (formValue.endDate != null && formValue.endDate != '') {
      let date = new Date(formValue.endDate);
      date.setDate(date.getDate() + 1);
      endDate = date.getTime();
    }
    const criteria: SearchBlogModel = {
      id: formValue.id,
      title: formValue.title,
      authorName: formValue.author,
      orderBy: BlogOrderBy.CREATED_DATE,
      sort: Sort.DESC,
      skip: (this.currentPage - 1) * this.pageSize,
      limit: this.pageSize,
      dateFrom: startDate,
      dateTo: endDate
    };
    return criteria;
  }

  // 重置搜尋
  onReset(): void {
    this.searchForm.reset();
    this.currentPage = 1;
    this.updatePagination();
  }

  // 清除搜尋
  onClear(): void {
    this.searchForm.reset();
    this.currentPage = 1;
    this.blogs = [];
    this.totalItems = 0;
    this.updatePagination();
  }

  // 更新分頁資料
  updatePagination(): void {
    // this.totalItems = this.filteredBlogs.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    // 如果當前頁數超過總頁數，重置到第一頁
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    // 計算當前頁面的資料
    // const startIndex = (this.currentPage - 1) * this.pageSize;
    // const endIndex = startIndex + this.pageSize;
    this.paginatedBlogs = [...this.blogs];
    this.cdr.markForCheck();
  }

  // 改變頁面大小
  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.pageSize = +target.value;;
      this.currentPage = 1; // 重置到第一頁
      this.updatePagination();
    }
  }

  // 跳轉到指定頁面
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.onSearch();
    }
  }

  // 上一頁
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.onSearch();
    }
  }

  // 下一頁
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.onSearch();
    }
  }

  // 取得分頁按鈕陣列
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // 總頁數不超過最大顯示頁數，顯示所有頁面
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 總頁數超過最大顯示頁數，智慧顯示
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, this.currentPage - half);
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

      // 調整起始位置
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // 取得當前顯示範圍的文字
  getDisplayRange(): string {
    if (this.totalItems === 0) {
      return '0 - 0';
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);

    return `${start} - ${end}`;
  }

  // 格式化日期時間
  formatDateTime(dateTimeString: number): string {
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 檢查是否有搜尋條件
  hasSearchCriteria(): boolean {
    const formValue = this.searchForm.value;
    return formValue.id || formValue.title || formValue.author || formValue.startDate || formValue.endDate;
  }

  getStatusDisplayName(status: any): string {
    return getPublishStatusDisplayName(status);
  }


  // 轉向細節頁
  goToDetail(blogId: number): void {
    this.router.navigate(['/blog', blogId]);
  }

  goToEdit(blogId: number): void {
    this.router.navigate(['/blog/edit', blogId]);
  }

  goToCreate(): void {
    this.router.navigate(['/blog/create']);
  }
}