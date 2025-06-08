export interface JwtPayload {
  // ✅ 標準 JWT 聲明
  iss?: string;    // issuer
  sub?: string;    // subject (通常是用戶 ID)
  aud?: string;    // audience
  exp?: number;    // expiration time
  nbf?: number;    // not before
  iat?: number;    // issued at
  jti?: string;    // JWT ID
  
  // ✅ 自定義聲明（根據你的後端調整）
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  
}