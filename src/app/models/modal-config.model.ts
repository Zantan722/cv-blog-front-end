export interface ModalConfig {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'loading';
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  showButtons?: boolean; // 控制是否顯示按鈕
  allowClose?: boolean;   // 控制是否允許關閉（ESC、背景點擊、X按鈕）
  onConfirm?: () => void | Promise<void>; // 確認按鈕回調
  onCancel?: () => void | Promise<void>;  // 取消按鈕回調
  onClose?: () => void | Promise<void>;   // 關閉時回調（包括 X 按鈕、ESC、背景點擊）
}