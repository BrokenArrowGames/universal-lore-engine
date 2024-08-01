import { AnyAbility } from "@casl/ability";

export class AuthUser {
  id: number;
  name: string;
  ability: AnyAbility;
}

export interface LoginRequest {
  username: string;
  password: string;
}
