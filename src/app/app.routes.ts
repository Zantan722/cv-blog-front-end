
import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: '/blog', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login/login.component').then(c => c.LoginComponent) },
    {
        path: 'home',
        loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
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