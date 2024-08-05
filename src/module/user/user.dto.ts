import { DeepPartial } from "typeorm";
import { UserEntity } from "@db/entity/user.entity";
import { RoleName } from "../auth/role/types";

export class UserDto {
  id: number;
  name: string;
}

export type CreateUserRequest = Omit<UserDto, "id"> & {
  password: string;
  email: string;
  role?: RoleName;
};

export type UpdateUserRequest = Pick<UserDto, "id"> &
  Partial<CreateUserRequest>;

export function UserDtoFromEntity(entity: UserEntity): UserDto {
  return {
    id: entity.id,
    name: entity.name,
  };
}

export function UserEntityFromDto(dto: UserDto): DeepPartial<UserEntity> {
  return {
    id: dto.id,
    name: dto.name,
  };
}
