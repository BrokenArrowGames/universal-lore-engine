import { AuthSubject } from '../util/auth-subjects';
import { AuthAction } from '../util/auth-actions';

export enum RoleName {
  GUEST = 'GUEST',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface AbilityUser {
  id: number;
  role: RoleName;
}

export class AuthContext {
  currentUser: AbilityUser;
}

export class Role {
  constructor(
    public readonly name: RoleName,
    public readonly permissions: Permission[],
  ) {}
}

export class Permission {
  constructor(
    public readonly action: AuthAction,
    public readonly subject: AuthSubject,
    public readonly fields?: string[],
    public readonly condition?: (context: AuthContext) => unknown,
    public readonly inverted: boolean = false,
  ) {}
}

export class InvertedPermission extends Permission {
  constructor(
    action: AuthAction,
    subject: AuthSubject,
    fields?: string[],
    condition?: (context: AuthContext) => unknown,
  ) {
    super(action, subject, fields, condition, true);
  }
}
