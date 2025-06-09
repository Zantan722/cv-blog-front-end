
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BlogComponent } from '../blog.component';
import { SearchBlogModel } from '../../../models/search-blog.model';
import { BlogOrderBy } from '../../../enums/blog-orderby.enum';
import { Sort } from '../../../enums/sort.enum';
import { UserRole } from '../../../enums/user-role.enum';

// Blog 模型

@Component({
  selector: 'app-blog',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './../blog.component.html',
  styleUrl: './../blog.component.css'
})
export class UserBlogComponent extends BlogComponent implements OnInit {

  protected override isUserSearchPage: boolean = true;
  protected override pageTile: string = '用戶管理Blog介面';

  protected override async onComponentInit(): Promise<void> {
    this.updatePagination();

    if (!this.isLoggedIn) {
      this.goToLogin();
    }
  }

  protected override generateCriteria(formValue: any): SearchBlogModel {
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
      userId: this.getUserId(),
      orderBy: BlogOrderBy.CREATED_DATE,
      sort: Sort.DESC,
      skip: (this.currentPage - 1) * this.pageSize,
      limit: this.pageSize,
      dateFrom: startDate,
      dateTo: endDate,
      userRole: UserRole.USER
    };
    return criteria;
  }
}