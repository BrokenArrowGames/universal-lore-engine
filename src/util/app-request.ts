import { Session } from 'express-session';
import { AuthUser } from '@mod/auth/auth.dto';

export interface AppSession extends Session {
  username: string;
  token: string;
}

export interface AppRequest {
  user?: AuthUser;
  session?: AppSession;
  correlationId: string;

  method: string;
  originalUrl: string;
  get: (key: string) => string;
  body: string;
}

export interface AppResponse {
  statusCode: number;

  append: (key: string, val: string) => void;
}

export interface ErrorResponse {
  status: number;
  type: string;
  message: string;
  details?: string[];
}

export type NextFunction = () => void;
