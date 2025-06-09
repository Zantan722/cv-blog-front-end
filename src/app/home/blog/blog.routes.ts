
import { Routes } from '@angular/router';
import { authGuard } from '../../auth.guard';


export const blogRoutes: Routes = [
  { path: '', loadComponent: () => import('./blog.component').then(c => c.BlogComponent) }, // /home 時顯示 BlogComponent
  { path: 'user',loadComponent: () => import('./user/user-blog.component').then(c => c.UserBlogComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./admin/admin-blog.component').then(c => c.AdminBlogComponent), canActivate: [authGuard] },
  { path: 'create', loadComponent: () => import('./modify/blog-create.component').then(c => c.BlogCreateComponent), canActivate: [authGuard] },
  { path: 'edit/:id',loadComponent: () => import('./modify/blog-modify.component').then(c => c.BlogModifyComponent), canActivate: [authGuard] },
  { path: ':id', loadComponent: () => import('./blog-detail/blog-detail.component').then(c => c.BlogDetailComponent) }, // /home/:id 時顯示 BlogDetailComponent

];