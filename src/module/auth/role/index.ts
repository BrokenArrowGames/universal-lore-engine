import { AdminRole } from "./admin.role";
import { Role, RoleName } from "./types";
import { UserRole } from "./user.role";
import { GuestRole } from "./guest.role";

export const Roles: Record<RoleName, Role> = {
  // default role
  GUEST: GuestRole,

  // primary roles
  USER: UserRole,
  ADMIN: AdminRole,
};
