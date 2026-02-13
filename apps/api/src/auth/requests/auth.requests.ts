export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
}
