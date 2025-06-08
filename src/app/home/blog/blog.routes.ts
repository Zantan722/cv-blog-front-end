
import { Routes } from '@angular/router';
import { BlogComponent } from './blog.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { UserBlogComponent } from './user/user-blog.component';

export const blogRoutes: Routes = [
  { path: '', component: BlogComponent }, // /home 時顯示 BlogComponent
  { path: 'user', component: UserBlogComponent },
  { path: ':id', component: BlogDetailComponent }, // /home/:id 時顯示 BlogDetailComponent
  
];