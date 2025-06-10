import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfileInfo } from '../models/profile.mode';
import { ApiResponse } from '../models/api-response.model';
import { JwtHelperService } from './jwt-helper.service';
import { UserRole } from '../enums/user-role.enum';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = new BehaviorSubject<boolean>(false); // ✅ 初始設為 false
  tokenJWT: string = '';
  userName: string = '';
  userEmail: string = '';
  userRole: UserRole | null = null;
  userId: number = -1;
  private isInitialized = false;
  private tokenExpirationTimer?: any;

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router,
    private notificationService:NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // ✅ 在構造函數中初始化
    this.initialize();
  }

  // ✅ 初始化方法
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('🔄 AuthService 初始化中...');

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt');

      if (token) {
        console.log('🔑 發現已存在的 token，驗證並獲取用戶資訊');
        if (this.jwtHelper.isTokenExpired(token)) {
          console.log('⏰ Token 已過期，清除資料');
          this.clearAuthData();
          this.notificationService.info('登入已過期請重新登入');
          this.router.navigate(['/login']);
        } else {
          this.tokenJWT = token;

          this.extractUserInfoFromToken(token);
          // ✅ 嘗試獲取用戶資訊來驗證 token
          this.getUserInfo(token).subscribe({
            next: (response) => {
              console.log('✅ 成功載入用戶資訊:', response);
              this.handleUserInfoSuccess(response);
              this.isInitialized = true;

            },
            error: (error) => {
              console.error('❌ Token 無效或用戶資訊載入失敗:', error);
              this.clearAuthData();
              this.isInitialized = true;
            }
          });
        }
      } else {
        console.log('ℹ️ 沒有找到 token，用戶未登入');
        this.loggedIn.next(false);
        this.isInitialized = true;
      }
    } else {
      console.log('🖥️ 伺服器端渲染環境');
      this.loggedIn.next(false);
      this.isInitialized = true;
    }
  }

  // ✅ 處理用戶資訊成功的情況
  private handleUserInfoSuccess(response: any): void {
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

      if (userProfile && userProfile.name) {
        this.userName = userProfile.name;
        this.userEmail = userProfile.email || '';
        this.userId = userProfile.id || -1;
        this.loggedIn.next(true);

      } else {
        console.error('❌ 用戶資料不完整:', userProfile);
        this.clearAuthData();
      }

    } catch (error) {
      console.error('❌ 處理用戶資料失敗:', error);
      this.clearAuthData();
    }
  }

  // ✅ 清除認證資料
  private clearAuthData(): void {
    console.log('🗑️ 清除認證資料');
    this.loggedIn.next(false);
    this.tokenJWT = '';
    this.userName = '';
    this.userEmail = '';
    this.userId = -1;
    this.userRole = null; // ✅ 設為 null

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = undefined;
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt');
    }
  }


  // ✅ 等待初始化完成
  private waitForInitialization(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve();
        return;
      }

      const checkInitialized = () => {
        if (this.isInitialized) {
          resolve();
        } else {
          setTimeout(checkInitialized, 50);
        }
      };
      checkInitialized();
    });
  }

  login(token: string): void {
    console.log('🔐 執行登入，token:', token);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwt', token);
    }
    this.tokenJWT = token;
    this.extractUserInfoFromToken(token);
    this.getUserInfo(token).subscribe({
      next: (response) => {
        console.log('📖 登入後獲取用戶資訊:', response);
        this.handleUserInfoSuccess(response);
      },
      error: (error) => {
        console.error('❌ 登入後獲取用戶資訊失敗:', error);
        this.clearAuthData();
      }
    });
  }

  getUserInfo(token: string): Observable<ApiResponse<ProfileInfo>> {
    return this.http.get<ApiResponse<ProfileInfo>>(`/user/profile`);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  // ✅ 同步檢查登入狀態，確保已初始化
  isLoggedInSync(): boolean {
    return this.loggedIn.value;
  }

  // ✅ 異步檢查登入狀態，等待初始化完成
  async isLoggedInAsync(): Promise<boolean> {
    await this.waitForInitialization();
    return this.loggedIn.value;
  }

  logout(): void {
    console.log('👋 執行登出');
    this.clearAuthData();
  }

  getCurrentUser(): { name: string; email: string; id: number; role: UserRole | null } {
    const user = {
      name: this.userName,
      email: this.userEmail,
      id: this.userId,
      role: this.userRole
    };

    console.log('👤 getCurrentUser 被呼叫，返回:', user);
    return user;
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

  // ✅ 檢查是否已初始化
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }


  private extractUserInfoFromToken(token: string): void {
    try {
      const payload = this.jwtHelper.getTokenInfo(token);

      if (payload) {
        this.userRole = this.parseUserRole(payload.role);

        console.log('✅ 從 JWT 提取用戶資訊:', {
          userRole: this.userRole,
          tokenExpiry: this.jwtHelper.getFormattedExpirationTime(token),
          remainingTime: this.jwtHelper.getTokenRemainingTime(token) + ' 秒'
        });
      } else {
        console.error('❌ 無法解析 JWT payload');
        this.clearAuthData();
      }
    } catch (error) {
      console.error('❌ 提取用戶資訊失敗:', error);
      this.clearAuthData();
    }
  }


  private parseUserRole(roleString: any): UserRole | null {
    if (!roleString) {
      console.log('ℹ️ JWT 中沒有角色資訊');
      return null;
    }

    // 檢查是否為有效的 UserRole
    if (Object.values(UserRole).includes(roleString as UserRole)) {
      return roleString as UserRole;
    }

    console.warn('⚠️ JWT 中的角色不在預期範圍內:', roleString);
    return null;
  }

}