import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private modalService: ModalService = inject(ModalService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() { }


  /**
   * 顯示警告訊息
   * @param message 訊息內容
   * @param useNativeAlert 是否使用原生 alert（預設為 false）
   */
  async alert(message: string, useNativeAlert: boolean = false): Promise<void> {
    if (this.isBrowser) {
      if (useNativeAlert) {
        alert(message);
      } else {
        await this.modalService.alert(message);
      }
    } else {
      // 伺服器端記錄到 console
      console.warn('📢 [SERVER] Alert:', message);
    }
  }

  /**
   * 顯示確認對話框
   * @param message 訊息內容
   * @param useNativeConfirm 是否使用原生 confirm（預設為 false）
   * @returns 使用者選擇結果
   */
  async confirm(message: string, title: string, onConfirm?: () => void | Promise<void>, onCancel?: () => void | Promise<void>, useNativeConfirm: boolean = false): Promise<boolean> {
    if (this.isBrowser) {
      if (useNativeConfirm) {
        return confirm(message);
      } else {
        return await this.modalService.confirm(message, title, onConfirm, onCancel);
      }
    } else {
      console.warn('📢 [SERVER] Confirm:', message);
      return false; // 伺服器端預設返回 false
    }
  }

  /**
   * 顯示提示輸入框（保留原生 prompt）
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
   * 顯示成功訊息
   * @param message 成功訊息
   * @param useNativeAlert 是否使用原生 alert（預設為 false）
   */
  async success(message: string, useNativeAlert: boolean = false): Promise<void> {
    if (this.isBrowser) {
      if (useNativeAlert) {
        alert(`✅ ${message}`);
      } else {
        await this.modalService.success(message);
      }
    } else {
      console.log('✅ [SERVER] Success:', message);
    }
  }

  /**
   * 顯示錯誤訊息
   * @param message 錯誤訊息
   * @param useNativeAlert 是否使用原生 alert（預設為 false）
   */
  async error(message: string, useNativeAlert: boolean = false): Promise<void> {
    if (this.isBrowser) {
      if (useNativeAlert) {
        alert(`❌ ${message}`);
      } else {
        await this.modalService.error(message);
      }
    } else {
      console.error('❌ [SERVER] Error:', message);
    }
  }

  /**
   * 顯示警告訊息
   * @param message 警告訊息
   * @param useNativeAlert 是否使用原生 alert（預設為 false）
   */
  async warning(message: string, useNativeAlert: boolean = false): Promise<void> {
    if (this.isBrowser) {
      if (useNativeAlert) {
        alert(`⚠️ ${message}`);
      } else {
        await this.modalService.warning(message);
      }
    } else {
      console.warn('⚠️ [SERVER] Warning:', message);
    }
  }

  /**
   * 顯示資訊訊息
   * @param message 資訊訊息
   * @param useNativeAlert 是否使用原生 alert（預設為 false）
   */
  async info(message: string, useNativeAlert: boolean = false): Promise<void> {
    if (this.isBrowser) {
      if (useNativeAlert) {
        alert(`ℹ️ ${message}`);
      } else {
        await this.modalService.info(message);
      }
    } else {
      console.info('ℹ️ [SERVER] Info:', message);
    }
  }

  /**
   * 顯示載入中訊息
   * @param message 載入訊息
   * @param title 標題
   * @returns Modal 組件參考，用於手動關閉
   */
  showLoading(message: string = '處理中，請稍候...', title?: string) {
    if (this.isBrowser) {
      return this.modalService.showLoading(message, title);
    } else {
      console.log('⏳ [SERVER] Loading:', message);
      return null;
    }
  }

  /**
   * 更新載入中訊息
   * @param message 新的訊息
   * @param title 新的標題
   */
  updateLoading(message: string, title?: string): void {
    if (this.isBrowser) {
      this.modalService.updateLoading(message, title);
    } else {
      console.log('⏳ [SERVER] Loading Update:', message);
    }
  }

  /**
   * 關閉載入中訊息
   */
  closeLoading(): void {
    if (this.isBrowser) {
      this.modalService.closeProccessingModal();
    }
  }

  // 直接訪問 ModalService 的方法
  get modal() {
    return this.modalService;
  }
}