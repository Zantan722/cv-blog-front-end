import { Injectable, ApplicationRef, Injector, EmbeddedViewRef, ComponentRef, inject, PLATFORM_ID, createComponent, EnvironmentInjector } from '@angular/core';
import { ModalConfig } from '../models/modal-config.model';
import { ModalComponent } from '../modal/modal.component';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalComponentRef: ComponentRef<ModalComponent> | null = null;
  private appRef: ApplicationRef = inject(ApplicationRef);
  private environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() { }

  /**
     * 關閉 Modal
     */
  close(): void {
    if (this.modalComponentRef) {
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
    }
  }

  closeProccessingModal(): void {
    if (this.modalComponentRef && this.modalComponentRef.instance.config.type === 'loading') {
      this.appRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
    }
  }

  /**
   * 顯示 Modal
   * @param config Modal 配置
   * @returns Promise，返回用戶選擇結果
   */
  show(config: ModalConfig): Promise<boolean> {
    return new Promise((resolve) => {

      if (!this.isBrowser) {
        resolve(false);
        return;
      }

      // 關閉現有的 Modal
      this.close();

      // 創建 Modal 組件
      this.modalComponentRef = createComponent(ModalComponent, {
        environmentInjector: this.environmentInjector
      });

      // 設置配置和事件監聽
      this.modalComponentRef.instance.config = config;
      this.modalComponentRef.instance.isVisible = true;

      this.modalComponentRef.instance.confirmed.subscribe(async (result: boolean) => {
        try {
          if (result && config.onConfirm) {
            // 執行確認回調
            await config.onConfirm();
          } else if (!result && config.onCancel) {
            // 執行取消回調
            await config.onCancel();
          }
        } catch (error) {
          console.error('Modal callback error:', error);
        }
        resolve(result);
      });

      this.modalComponentRef.instance.closed.subscribe(async () => {
        try {
          if (config.onClose) {
            await config.onClose();
          }
        } catch (error) {
          console.error('Modal close callback error:', error);
        }
        this.close();
      });

      // 將組件添加到 DOM
      this.appRef.attachView(this.modalComponentRef.hostView);
      const domElem = (this.modalComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    });
  }

  /**
   * 顯示警告訊息
   * @param message 訊息內容
   * @param title 標題
   */
  async alert(message: string, title?: string): Promise<void> {
    await this.show({
      message,
      title,
      type: 'info',
      showCancel: false,
      confirmText: '確定'
    });
  }

  /**
   * 顯示確認對話框
   * @param message 訊息內容
   * @param title 標題
   * @param onConfirm 確認時的回調函數
   * @param onCancel 取消時的回調函數
   * @returns 用戶選擇結果
   */
  async confirm(
    message: string,
    title?: string,
    onConfirm?: () => void | Promise<void>,
    onCancel?: () => void | Promise<void>
  ): Promise<boolean> {
    return await this.show({
      message,
      title,
      type: 'confirm',
      showCancel: true,
      confirmText: '確定',
      cancelText: '取消',
      onConfirm,
      onCancel
    });
  }

  /**
   * 顯示成功訊息
   * @param message 成功訊息
   * @param title 標題
   */
  async success(message: string, title?: string): Promise<void> {
    await this.show({
      message,
      title,
      type: 'success',
      showCancel: false,
      confirmText: '確定'
    });
  }

  /**
   * 顯示錯誤訊息
   * @param message 錯誤訊息
   * @param title 標題
   */
  async error(message: string, title?: string): Promise<void> {
    await this.show({
      message,
      title,
      type: 'error',
      showCancel: false,
      confirmText: '確定'
    });
  }

  /**
   * 顯示警告訊息
   * @param message 警告訊息
   * @param title 標題
   */
  async warning(message: string, title?: string): Promise<void> {
    await this.show({
      message,
      title,
      type: 'warning',
      showCancel: false,
      confirmText: '確定'
    });
  }

  /**
   * 顯示資訊訊息
   * @param message 資訊訊息
   * @param title 標題
   */
  async info(message: string, title?: string): Promise<void> {
    await this.show({
      message,
      title,
      type: 'info',
      showCancel: false,
      confirmText: '確定'
    });
  }

  /**
   * 顯示載入中 Modal
   * @param message 載入訊息
   * @param title 標題
   * @returns Modal 組件參考，用於手動關閉
   */
  showLoading(message: string = '處理中，請稍候...', title?: string): ComponentRef<ModalComponent> {
    // 關閉現有的 Modal
    this.close();

    // 創建 Modal 組件
    this.modalComponentRef = createComponent(ModalComponent, {
      environmentInjector: this.environmentInjector
    });

    // 設置 Loading 配置
    this.modalComponentRef.instance.config = {
      message,
      title,
      type: 'loading',
      showButtons: false,  // 不顯示按鈕
      allowClose: false    // 不允許用戶關閉
    };
    this.modalComponentRef.instance.isVisible = true;

    // 將組件添加到 DOM
    this.appRef.attachView(this.modalComponentRef.hostView);
    const domElem = (this.modalComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    return this.modalComponentRef;
  }

  /**
   * 更新載入中 Modal 的訊息
   * @param message 新的訊息
   * @param title 新的標題
   */
  updateLoading(message: string, title?: string): void {
    if (this.modalComponentRef && this.modalComponentRef.instance.config.type === 'loading') {
      this.modalComponentRef.instance.config.message = message;
      if (title !== undefined) {
        this.modalComponentRef.instance.config.title = title;
      }
    }
  }
}