import {
  AnyAbility,
  createMongoAbility,
  MongoAbility,
  RawRuleOf,
} from "@casl/ability";
import { AuthAction } from "./auth-actions";
import { AuthSubject } from "./auth-subjects";
import { AbilityUser, RoleName } from "../role/types";
import { Roles } from "../role";

export type AppAbility = MongoAbility<[AuthAction, AuthSubject]>;

export function createAbility(user?: AbilityUser): AnyAbility {
  const role = user?.role ?? RoleName.GUEST;
  const rules: RawRuleOf<AppAbility>[] = Roles[role].permissions.map(
    (permission) => ({
      action: permission.action,
      subject: permission.subject,
      fields: permission.fields,
      conditions: permission.condition?.({ currentUser: user }) as any,
      inverted: permission.inverted,
      reason: undefined, // permission.reason
    }),
  );
  return createMongoAbility<AppAbility>(rules);
}
