import { AuthAction } from "../util/auth-actions";
import { AuthSubject } from "../util/auth-subjects";
import { Permission, Role, RoleName } from "./types";
import { UserRole } from "./user.role";

export const AdminRole = new Role(RoleName.ADMIN, [
  // inherited
  ...UserRole.permissions,

  // subject
  new Permission(AuthAction.CREATE, AuthSubject.SUBJECT),
  new Permission(AuthAction.READ, AuthSubject.SUBJECT),
  new Permission(AuthAction.READ, AuthSubject.SUBJECT),
  new Permission(AuthAction.UPDATE, AuthSubject.SUBJECT),
  new Permission(AuthAction.DELETE, AuthSubject.SUBJECT),
  new Permission(AuthAction.DELETE_SOFT, AuthSubject.SUBJECT),
  new Permission(AuthAction.LIST, AuthSubject.SUBJECT),

  // user
  new Permission(AuthAction.CREATE, AuthSubject.USER),
  new Permission(AuthAction.READ, AuthSubject.USER),
  new Permission(AuthAction.UPDATE, AuthSubject.USER),
  new Permission(AuthAction.DELETE, AuthSubject.USER),
  new Permission(AuthAction.DELETE_SOFT, AuthSubject.USER),
  new Permission(AuthAction.LIST, AuthSubject.USER),
]);
