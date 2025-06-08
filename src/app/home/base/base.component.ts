import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { UserRole } from '../../enums/user-role.enum';


@Component({
  template: '' // 基類不需要模板
})
export abstract class BaseComponent implements OnInit, OnDestroy {
  // ✅ 共享的認證相關屬性
  public authService = inject(AuthService);
  protected router = inject(Router);

  isLoggedIn = false;
  userName = '';
  userId = -1;
  userRole: UserRole | null = null;
  isServiceInitialized = false;
  private authSubscription?: Subscription;

  constructor() { }

  async ngOnInit(): Promise<void> {
    console.log('🔄 BaseComponent 初始化中...');

    // ✅ 等待 AuthService 初始化完成
    await this.waitForAuthServiceInitialization();

    // ✅ 訂閱登入狀態變化
    this.authSubscription = this.authService.isLoggedIn().subscribe({
      next: (status) => {
        console.log('🔐 BaseComponent 收到登入狀態變更:', status);
        this.isLoggedIn = status;
        this.updateUserInfo();
      },
      error: (error) => {
        console.error('❌ 登入狀態訂閱錯誤:', error);
        this.isLoggedIn = false;
        this.userName = '';
        this.userId = -1;
      }
    });

    // ✅ 初始化狀態
    this.isLoggedIn = this.authService.isLoggedInSync();
    this.updateUserInfo();
    this.isServiceInitialized = true;

    console.log('✅ BaseComponent 初始化完成:', {
      isLoggedIn: this.isLoggedIn,
      userName: this.userName,
      userId: this.userId
    });

    // ✅ 呼叫子類的初始化方法
    await this.onComponentInit();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    // ✅ 呼叫子類的清理方法
    this.onComponentDestroy();
  }

  // ✅ 子類可以覆寫的初始化方法
  protected async onComponentInit(): Promise<void> {
    // 子類可以覆寫這個方法來執行自己的初始化邏輯
  }

  // ✅ 子類可以覆寫的清理方法
  protected onComponentDestroy(): void {
    // 子類可以覆寫這個方法來執行自己的清理邏輯
  }

  // ✅ 等待 AuthService 初始化
  protected async waitForAuthServiceInitialization(): Promise<void> {
    return new Promise((resolve) => {
      const checkInitialized = () => {
        if (this.authService.isServiceInitialized()) {
          resolve();
        } else {
          setTimeout(checkInitialized, 50);
        }
      };
      checkInitialized();
    });
  }

  // ✅ 更新用戶名稱
  protected updateUserInfo(): void {
    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      this.userName = user.name || '用戶';
      this.userId = user.id;
      this.userRole = user.role;
      console.log('👤 更新用戶名稱:', this.userName, user.role);
    } else {
      this.userName = '';
      this.userId = -1;
    }
  }

  // ✅ 共享的方法
  getUserName(): string {
    return this.userName || '用戶';
  }

  getUserId(): number {
    return this.userId;
  }

  logout(): void {
    console.log('👋 執行登出');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // ✅ 導航相關的共用方法
  navigateTo(path: string[]): void {
    this.router.navigate(path);
  }

  isAdmin(): boolean {
    return this.userRole === UserRole.ADMIN;
  }

}