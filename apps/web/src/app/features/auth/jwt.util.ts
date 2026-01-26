export interface JWTPayload {
    sub?: string;
    username?: string;
    role?: 'ADMIN' | 'OWNER' | 'USER';
    iat?: number;
    exp?: number;
}


export function getUserIdFromPayload(payload: JWTPayload | null): number | null {
  if (!payload?.sub) return null;
  const id = Number(payload.sub);
  return Number.isFinite(id) ? id : null;
}

export function decodeJWT(token: string): JWTPayload | null {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch{
        return null;
    }
}