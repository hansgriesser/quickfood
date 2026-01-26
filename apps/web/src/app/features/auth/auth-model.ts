export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export type RegisterRole = 'USER' | 'OWNER';

export interface RegisterRequest {
  username: string;
  password: string;
  role: RegisterRole;
}

export interface RegisterResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    role: RegisterRole;
  };
}