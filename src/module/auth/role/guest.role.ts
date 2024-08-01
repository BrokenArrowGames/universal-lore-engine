import { AuthAction } from "../util/auth-actions";
import { Condition } from "../util/auth-conditions";
import { AuthSubject } from "../util/auth-subjects";
import { InvertedPermission, Permission, Role, RoleName } from "./types";

export const GuestRole = new Role(
  RoleName.GUEST,
  [
    // inherited
    
    // subject
    new Permission(AuthAction.READ, AuthSubject.SUBJECT, undefined, Condition.IsPublic),
    new Permission(AuthAction.LIST, AuthSubject.SUBJECT, undefined, Condition.IsPublic),
    new InvertedPermission(AuthAction.READ, AuthSubject.SUBJECT, ["note"]),

    // user
  ]
);