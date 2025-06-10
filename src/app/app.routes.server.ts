import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // 靜態路由使用預渲染
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'blog',
    renderMode: RenderMode.Prerender
  },
  
  // 動態路由使用 SSR (不使用預渲染)
  {
    path: 'blog/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'blog/edit/:id', 
    renderMode: RenderMode.Server
  },
  {
    path: 'home/blog/edit/:id',
    renderMode: RenderMode.Server
  },
  
  // 其他所有路由使用 SSR
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];