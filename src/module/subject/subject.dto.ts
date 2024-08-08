import { DeepPartial } from "typeorm";
import { SubjectEntity, SubjectType } from "@db/entity/subject.entity";
import {
  UserDto,
  UserDtoFromEntity,
  UserEntityFromDto,
} from "../user/user.dto";
import {
  SubjectTagDto,
  SubjectTagDtoFromEntity,
  SubjectTagEntityFromDto,
} from "./subject-tag.dto";

export class SubjectDto {
  id: number;
  private: boolean;
  key: string;
  display_name: string;
  type: SubjectType;
  tags: SubjectTagDto[];
  short_description?: string;
  long_description?: string;
  note?: string;
  createdBy?: UserDto;
  createdAt?: Date;
  modifiedBy?: UserDto;
  modifiedAt?: Date;
}

export type CreateSubjectRequest = Omit<
  SubjectDto,
  | "id"
  | "long_description"
  | "createdBy"
  | "createdAt"
  | "modifiedBy"
  | "modifiedAt"
> &
Required<Pick<SubjectDto, "long_description">>;

export type UpdateSubjectRequest = Partial<CreateSubjectRequest>;

export function SubjectDtoFromEntity(entity: SubjectEntity): SubjectDto {
  return {
    id: entity.id,
    private: entity.private,
    key: entity.key,
    display_name: entity.display_name,
    type: entity.type,
    tags: entity.tags.map(SubjectTagDtoFromEntity),
    short_description: entity.short_description,
    long_description: entity.long_description,
    note: entity.note,
    createdBy: entity.createdBy
      ? UserDtoFromEntity(entity.createdBy)
      : undefined,
    createdAt: entity.createdAt,
    modifiedBy: entity.modifiedBy
      ? UserDtoFromEntity(entity.modifiedBy)
      : undefined,
    modifiedAt: entity.modifiedAt,
  };
}

export function SubjectEntityFromDto(
  dto: SubjectDto,
): DeepPartial<SubjectEntity> {
  return {
    id: dto.id,
    private: dto.private,
    key: dto.key,
    display_name: dto.display_name,
    type: dto.type,
    tags: dto.tags.map(SubjectTagEntityFromDto),
    short_description: dto.short_description,
    long_description: dto.long_description,
    note: dto.note,
    modifiedBy: dto.modifiedBy ? UserEntityFromDto(dto.modifiedBy) : undefined,
    modifiedAt: dto.modifiedAt,
  };
}
