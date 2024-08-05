import { AnyAbility } from "@casl/ability";
import { RoleName } from "./role/types";

export class AuthUser {
  id: number;
  name: string;
  role: RoleName;
  ability: AnyAbility;
}

export interface LoginRequest {
  username: string;
  password: string;
}
