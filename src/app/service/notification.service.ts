import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * 顯示警告訊息
   * @param message 訊息內容
   */
  alert(message: string): void {
    if (this.isBrowser) {
      alert(message);
    } else {
      // 伺服器端記錄到 console
      console.warn('📢 [SERVER] Alert:', message);
    }
  }

  /**
   * 顯示確認對話框
   * @param message 訊息內容
   * @returns 使用者選擇結果
   */
  confirm(message: string): boolean {
    if (this.isBrowser) {
      return confirm(message);
    } else {
      console.warn('📢 [SERVER] Confirm:', message);
      return false; // 伺服器端預設返回 false
    }
  }

  /**
   * 顯示提示輸入框
   * @param message 提示訊息
   * @param defaultValue 預設值
   * @returns 使用者輸入內容
   */
  prompt(message: string, defaultValue?: string): string | null {
    if (this.isBrowser) {
      return prompt(message, defaultValue);
    } else {
      console.warn('📢 [SERVER] Prompt:', message);
      return null; // 伺服器端預設返回 null
    }
  }

  /**
   * 顯示成功訊息（可擴展為 toast 通知）
   * @param message 成功訊息
   */
  success(message: string): void {
    if (this.isBrowser) {
      // 目前使用 alert，未來可以改為 toast
      alert(`✅ ${message}`);
    } else {
      console.log('✅ [SERVER] Success:', message);
    }
  }

  /**
   * 顯示錯誤訊息
   * @param message 錯誤訊息
   */
  error(message: string): void {
    if (this.isBrowser) {
      alert(`❌ ${message}`);
    } else {
      console.error('❌ [SERVER] Error:', message);
    }
  }

  /**
   * 顯示警告訊息
   * @param message 警告訊息
   */
  warning(message: string): void {
    if (this.isBrowser) {
      alert(`⚠️ ${message}`);
    } else {
      console.warn('⚠️ [SERVER] Warning:', message);
    }
  }

  /**
   * 顯示資訊訊息
   * @param message 資訊訊息
   */
  info(message: string): void {
    if (this.isBrowser) {
      alert(`ℹ️ ${message}`);
    } else {
      console.info('ℹ️ [SERVER] Info:', message);
    }
  }
}