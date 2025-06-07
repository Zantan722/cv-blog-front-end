// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, map } from 'rxjs';
import { ApiResponse } from './models/api-response.model';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🚀 Interceptor 執行 - URL:', req.url);
  console.log('加入 JWT token');
  const router = inject(Router);
  // const jwt = localStorage.getItem('jwt');
  const platformId = inject(PLATFORM_ID);

  // 加入認證標頭
  let authReq = req;
  if (isPlatformBrowser(platformId)) {
    try {
      const jwt = localStorage.getItem('jwt');

      if (jwt) {
        console.log('📝 加入 JWT token');
        authReq = req.clone({
          setHeaders: {
            'Authorization': 'Bearer ' + jwt,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.warn('⚠️ 無法存取 localStorage:', error);
    }
  } else {
    console.log('🖥️ 伺服器端渲染，跳過 localStorage 存取');
  }

  return next(authReq).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        console.log('✅ 收到回應:', event);

        // 處理成功回應的業務邏輯
        if (event.status === 200 && event.body) {
          const responseBody = event.body as ApiResponse;
          console.log('✅ 收到回應:', responseBody);
          if (responseBody.statusCode === 0) {
            console.log('✅ 業務邏輯成功');
            if (responseBody.data !== undefined) {
              return event.clone({ body: responseBody.data });
            } else {
              return event.clone({ body: true });
            }
          } else {
            console.log('❌ 業務邏輯失敗:', responseBody.message);
            if (responseBody.message) {
              alert(responseBody.message);
            }
            return event.clone({ body: false });
          }
        }
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      console.log('❌ HTTP 錯誤:', error.status, error.message);
      console.log('❌ 錯誤詳情:', error); // ← 加入詳細錯誤資訊

      // ✅ 只在瀏覽器環境中執行瀏覽器特定操作
      if (isPlatformBrowser(platformId)) {
        switch (error.status) {
          case 401:
            console.log('🔐 未授權，清除 token 並跳轉到登入頁');
            localStorage.removeItem('jwt');
            router.navigate(['/login']);
            break;
          case 403:
            console.log('🚫 權限不足');
            alert('權限不足: ' + error.message);
            break;
          default:
            console.log('🔥 系統錯誤');
            alert("系統忙碌中，請稍後再試，若持續發生，請聯繫相關人員");
        }
      }
      return throwError(() => error);
    })
  );
};