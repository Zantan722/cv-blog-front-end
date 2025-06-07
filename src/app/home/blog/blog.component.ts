import { SearchBlogModel } from '../../models/search-blog.model';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogModel } from '../../models/blog.model';
import { BlogService } from '../../service/blog.service';
import { BlogOrderBy } from '../../enums/blog-orderby.enum';
import { Sort } from '../../enums/sort.enum';
import { ApiResponse } from '../../models/api-response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Pageable } from '../../models/api-page.model';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

// Blog 模型

@Component({
  selector: 'app-blog',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {

  searchForm: FormGroup;
  blogs: BlogModel[] = [];
  paginatedBlogs: BlogModel[] = [];
  isLoading = false;

  // 分頁相關屬性
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  pageSizeOptions = [10, 20, 50, 100];

  // TrackBy 函數
  trackByBlogId = (index: number, blog: BlogModel) => blog.id;

  constructor(private fb: FormBuilder, private blogService: BlogService, private router: Router) {
    this.searchForm = this.fb.group({
      id: [''],
      title: ['',],
      author: ['', [Validators.minLength(2)]],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.updatePagination();
  }


  // 搜尋功能
  onSearch(): void {
    this.isLoading = true;
    const formValue = this.searchForm.value;
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
    this.blogService.searchBlog(criteria)
      .pipe(
        finalize(() => {
          // ✅ 無論成功或失敗都會執行
          this.currentPage = 1;
          this.updatePagination();
          this.isLoading = false;
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
                this.blogs = pageData?.list || [];
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
                this.blogs = pageData?.list || [];
              } else {
                console.error('❌ 分頁資料格式不正確');
                this.blogs = [];
                this.totalItems = 0;
              }
            }
          } catch (error) {
            console.error('❌ 處理回應時發生錯誤:', error);
            this.blogs = [];
            this.totalItems = 0;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('登入失敗:', error);
          try {
            const errorData = error.error as ApiResponse;
            if (errorData.message) {
              alert(errorData.message);
            } else {
              alert('登入失敗，請檢查帳號密碼');
            }
          } catch (e) {
            alert('登入失敗，請檢查帳號密碼');
          }

        }
      });


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
    this.paginatedBlogs = this.blogs;
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
      this.updatePagination();
    }
  }

  // 上一頁
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // 下一頁
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
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


  // 轉向細節頁
  goToDetail(blogId: number): void {
    console.log('📖 前往部落格詳情頁:', blogId);
    console.log('🔍 Router 物件:', this.router); // ← 檢查 router 是否存在

    this.router.navigate(['/blog', blogId]);

  }

}