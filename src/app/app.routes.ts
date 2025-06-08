import { HomeComponent } from './home/home.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { BlogComponent } from './home/blog/blog.component';
import { BlogDetailComponent } from './home/blog/blog-detail/blog-detail.component';


export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { 
        path: 'home', 
        component: HomeComponent,
        children: [
            { path: '', redirectTo: 'blog', pathMatch: 'full' },
            { path: 'blog', loadChildren: () => import('./home/blog/blog.routes').then(r => r.blogRoutes) },
            // 可以添加其他子路由
        ]
    },
    // 為了向後兼容，保留直接的 blog 路由但重定向到 home/blog
    { path: 'blog', redirectTo: '/home/blog', pathMatch: 'full' },
    { path: 'blog/edit/:id', redirectTo: '/home/blog/edit/:id', pathMatch: 'full' },
    { path: 'blog/:id', redirectTo: '/home/blog/:id' },
    // { path: '**', redirectTo: '/home' }
];