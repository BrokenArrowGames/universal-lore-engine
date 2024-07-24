export class AuthUser {
  id: number;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
