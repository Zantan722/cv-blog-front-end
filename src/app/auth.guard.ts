import { isPlatformBrowser } from '@angular/common';

import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // 只在瀏覽器環境中檢查 localStorage
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('jwt');
    if (token) {
      return true;
    } else {
      router.navigate(['/login']);
      return false;
    }
  }
  
  // SSR 環境中預設允許（會在客戶端重新檢查）
  return true;
};
