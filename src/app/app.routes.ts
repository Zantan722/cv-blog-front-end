import { HomeComponent } from './home/home.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { BlogComponent } from './home/blog/blog.component';
import { BlogDetailComponent } from './home/blog/blog-detail/blog-detail.component';

export const routes: Routes = [
    { path: '', redirectTo: '/blog', pathMatch: 'full' }, // ✅ 加入預設路由
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'blog', loadChildren: () => import('./home/blog/blog.routes').then(r => r.blogRoutes) },
    // { path: '**', redirectTo: '/blog' }
];
