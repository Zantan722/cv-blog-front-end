import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileInfo } from '../models/profile.mode';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = new BehaviorSubject<boolean>(this.checkInitialLoginState());
  tokenJWT: string = '';
  userName: string = '';
  userEmail: string = '';
  userId: number = -1;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  // ✅ 檢查初始登入狀態
  private checkInitialLoginState(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt');
      return !!token;
    }
    return false;
  }

  login(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwt', token);
    }
    this.tokenJWT = token;

    this.getUserInfo(token).subscribe({
      next: (response) => {
        console.log('📖 用戶資訊:', response);

        try {
          let userProfile: ProfileInfo;

          if (response && typeof response === 'object' && 'data' in response) {
            // ApiResponse 格式
            const apiResponse = response as ApiResponse<ProfileInfo>;
            userProfile = apiResponse.data!;
          } else {
            // 直接是 profile
            userProfile = response as unknown as ProfileInfo;
          }

          this.userName = userProfile.name;
          this.userEmail = userProfile.email;
          this.userId = userProfile.id; // ✅ 修正：應該是 userProfile.id 不是 this.userId
          this.loggedIn.next(true); // ✅ 修正：應該設為 true

          console.log('✅ 用戶資訊設定完成:', {
            name: this.userName,
            email: this.userEmail,
            id: this.userId
          });

        } catch (error) {
          console.error('❌ 處理用戶資料失敗:', error);
          this.loggedIn.next(false);
        }
      },

      error: (error) => {
        console.error('❌ 獲取用戶詳情失敗:', error);
        this.loggedIn.next(false);
        // ✅ 如果獲取用戶資訊失敗，移除 token
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('jwt');
        }
        this.tokenJWT = '';
      }
    });
  }

  getUserInfo(token: string): Observable<ApiResponse<ProfileInfo>> {
    return this.http.get<ApiResponse<ProfileInfo>>(`/user/profile`);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  isLoggedInSync(): boolean {
    return this.loggedIn.value;
  }

  logout(): void {
    this.loggedIn.next(false);
    this.tokenJWT = '';
    this.userName = '';
    this.userEmail = '';
    this.userId = -1;
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt');
    }
  }

  getCurrentUser(): { name: string; email: string; id: number } {
    return {
      name: this.userName,
      email: this.userEmail,
      id: this.userId
    };
  }
  getToken(): string {
    if (this.tokenJWT) {
      return this.tokenJWT;
    }
    
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt') || '';
    }
    
    return '';
  }
}