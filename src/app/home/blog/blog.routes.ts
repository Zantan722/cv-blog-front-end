
import { Routes } from '@angular/router';
import { BlogComponent } from './blog.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { UserBlogComponent } from './user/user-blog.component';
import { BlogCreateComponent } from './modify/blog-create.component';
import { BlogModifyComponent } from './modify/blog-modify.component';
import { AdminBlogComponent } from './admin/admin-blog.component';


export const blogRoutes: Routes = [
  { path: '', component: BlogComponent }, // /home 時顯示 BlogComponent
  { path: 'user', component: UserBlogComponent },
  { path: 'admin', component: AdminBlogComponent },
  { path: 'create', component: BlogCreateComponent },
  { path: 'edit/:id', component: BlogModifyComponent },
  { path: ':id', component: BlogDetailComponent }, // /home/:id 時顯示 BlogDetailComponent
  
];