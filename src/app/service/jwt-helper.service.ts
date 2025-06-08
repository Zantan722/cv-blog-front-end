import { Injectable } from '@angular/core';
import { JwtPayload } from '../models/jwt.model';

@Injectable({
  providedIn: 'root'
})
export class JwtHelperService {

  constructor() { }

  /**
   * 解析 JWT token 並返回 payload
   * @param token JWT token 字符串
   * @returns 解析後的 payload 對象
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      // ✅ 移除 'Bearer ' 前綴（如果存在）
      const cleanToken = token.replace(/^Bearer\s+/i, '');

      // ✅ JWT 分為三部分：header.payload.signature
      const parts = cleanToken.split('.');

      if (parts.length !== 3) {
        console.error('❌ 無效的 JWT token 格式');
        return null;
      }

      // ✅ 解析 payload（第二部分）
      const payload = parts[1];

      // ✅ Base64URL 解碼
      const decodedPayload = this.base64UrlDecode(payload);

      // ✅ 解析 JSON
      const parsedPayload = JSON.parse(decodedPayload);

      console.log('✅ JWT 解析成功:', parsedPayload);
      return parsedPayload;

    } catch (error) {
      console.error('❌ JWT 解析失敗:', error);
      return null;
    }
  }

  /**
   * 檢查 token 是否過期
   * @param token JWT token 字符串
   * @returns true 如果已過期，false 如果還有效
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);

    if (!payload || !payload.exp) {
      return true; // 沒有過期時間或解析失敗，視為過期
    }

    // ✅ exp 是 Unix 時間戳（秒），需要轉換為毫秒
    const expirationDate = new Date(payload.exp * 1000);
    const currentDate = new Date();

    const isExpired = currentDate >= expirationDate;

    console.log('🕐 Token 過期檢查:', {
      current: currentDate.toISOString(),
      expiration: expirationDate.toISOString(),
      isExpired: isExpired
    });

    return isExpired;
  }

  /**
   * 獲取 token 的剩餘有效時間（秒）
   * @param token JWT token 字符串
   * @returns 剩餘秒數，如果已過期或無效則返回 0
   */
  getTokenRemainingTime(token: string): number {
    const payload = this.decodeToken(token);

    if (!payload || !payload.exp) {
      return 0;
    }

    const expirationDate = new Date(payload.exp * 1000);
    const currentDate = new Date();
    const remainingMs = expirationDate.getTime() - currentDate.getTime();

    return Math.max(0, Math.floor(remainingMs / 1000));
  }
  /**
   * 獲取用戶角色
   * @param token JWT token 字符串
   * @returns 用戶角色
   */
  getUserRole(token: string): string | null {
    const payload = this.decodeToken(token);
    return payload?.role || null;
  }

  /**
   * 檢查用戶是否有特定權限
   * @param token JWT token 字符串
   * @param permission 權限名稱
   * @returns true 如果有權限
   */
  hasPermission(token: string, permission: string): boolean {
    const payload = this.decodeToken(token);
    const permissions = payload?.permissions;

    if (!Array.isArray(permissions)) {
      return false;
    }

    return permissions.includes(permission);
  }

  /**
   * Base64URL 解碼
   * @param str Base64URL 編碼的字符串
   * @returns 解碼後的字符串
   */
  private base64UrlDecode(str: string): string {
    // ✅ 將 Base64URL 轉換為 Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // ✅ 添加必要的填充
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) {
        throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
      }
      base64 += new Array(5 - pad).join('=');
    }

    // ✅ Base64 解碼
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }

  /**
   * 格式化過期時間為可讀格式
   * @param token JWT token 字符串
   * @returns 格式化的過期時間字符串
   */
  getFormattedExpirationTime(token: string): string {
    const payload = this.decodeToken(token);

    if (!payload || !payload.exp) {
      return '無過期時間';
    }

    const expirationDate = new Date(payload.exp * 1000);
    return expirationDate.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * 獲取完整的 token 信息（用於調試）
   * @param token JWT token 字符串
   * @returns token 的詳細信息
   */
  getTokenInfo(token: string): any {
    const payload = this.decodeToken(token);

    if (!payload) {
      return null;
    }
    console.log("JWT的Payload");
    console.log(payload);
    return {
      payload: payload,
      isExpired: this.isTokenExpired(token),
      remainingTime: this.getTokenRemainingTime(token),
      expirationTime: this.getFormattedExpirationTime(token),
      role: this.getUserRole(token)
    };
  }
}
