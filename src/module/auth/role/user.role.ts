import { AuthAction } from "../util/auth-actions";
import { Condition } from "../util/auth-conditions";
import { AuthSubject } from "../util/auth-subjects";
import { Permission, Role, RoleName } from "./types";
import { GuestRole } from "./guest.role";

export const UserRole = new Role(RoleName.USER, [
  // inherited
  ...GuestRole.permissions,

  // subject
  new Permission(AuthAction.CREATE, AuthSubject.SUBJECT),
  new Permission(
    AuthAction.READ,
    AuthSubject.SUBJECT,
    undefined,
    Condition.PropEqualsCurrentUserId("createdBy.id"),
  ),
  new Permission(
    AuthAction.UPDATE,
    AuthSubject.SUBJECT,
    undefined,
    Condition.PropEqualsCurrentUserId("createdBy.id"),
  ),
  new Permission(
    AuthAction.DELETE_SOFT,
    AuthSubject.SUBJECT,
    undefined,
    Condition.PropEqualsCurrentUserId("createdBy.id"),
  ),
  new Permission(
    AuthAction.LIST,
    AuthSubject.SUBJECT,
    undefined,
    Condition.PropEqualsCurrentUserId("createdBy.id"),
  ),
  // new Permission(AuthAction.READ_PRIVATE, AuthSubject.SUBJECT, undefined, (ctx) => { id: { $eq: ctx.currentUser.readList } }),
  // new Permission(AuthAction.UPDATE,       AuthSubject.SUBJECT, undefined, (ctx) => { id: { $eq: ctx.currentUser.writeList } }),

  // user
  new Permission(
    AuthAction.READ,
    AuthSubject.USER,
    undefined,
    Condition.PropEqualsCurrentUserId("id"),
  ),
  new Permission(
    AuthAction.UPDATE,
    AuthSubject.USER,
    undefined,
    Condition.PropEqualsCurrentUserId("id"),
  ),
  new Permission(
    AuthAction.READ,
    AuthSubject.USER,
    undefined,
    Condition.PropEqualsCurrentUserId("id"),
  ),
  new Permission(
    AuthAction.DELETE_SOFT,
    AuthSubject.USER,
    undefined,
    Condition.PropEqualsCurrentUserId("id"),
  ),
]);
