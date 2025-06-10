// modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, ComponentFactoryResolver, ApplicationRef, Injector, ComponentRef, EmbeddedViewRef } from '@angular/core';
import { ModalConfig } from '../models/modal-config.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  imports: [CommonModule]
})

export class ModalComponent implements OnInit {
  @Input() config: ModalConfig = { message: '' };
  @Input() isVisible: boolean = false;
  @Output() confirmed = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  private modalComponentRef: ComponentRef<ModalComponent> | null = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  ngOnInit() {
    // 監聽 ESC 鍵 (只有在允許關閉時)
    if (this.isVisible && this.canClose()) {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  private async handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.canClose()) {
      this.onCancel();
    }
  }

  getIcon(): string {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      confirm: '❓',
      loading: '⏳'
    };
    return icons[this.config.type || 'info'];
  }

  getDefaultTitle(): string {
    const titles = {
      info: '資訊',
      success: '成功',
      warning: '警告',
      error: '錯誤',
      confirm: '確認',
      loading: '處理中'
    };
    return titles[this.config.type || 'info'];
  }

  getHeaderClass(): string {
    return `modal-header modal-header-${this.config.type || 'info'}`;
  }

  getConfirmButtonClass(): string {
    return `modal-btn modal-btn-confirm modal-btn-${this.config.type || 'info'}`;
  }

  isLoading(): boolean {
    return this.config.type === 'loading';
  }

  canClose(): boolean {
    return this.config.allowClose !== false;
  }

  showButtons(): boolean {
    return this.config.showButtons !== false;
  }

  async onConfirm() {
    this.confirmed.emit(true);
    this.close();
  }

  async onCancel() {
    this.confirmed.emit(false);
    this.close();
  }

  async onOverlayClick() {
    // 點擊背景關閉 (只有在允許關閉時)
    if (this.canClose()) {
      this.onCancel();
    }
  }

  private close() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.closed.emit();
  }
}