import { DeepPartial } from 'typeorm';
import { SubjectEntity, SubjectType } from '@db/entity/subject.entity';
import {
  UserDto,
  UserDtoFromEntity,
  UserEntityFromDto,
} from '../user/user.dto';
import {
  SubjectTagDto,
  SubjectTagDtoFromEntity,
  SubjectTagEntityFromDto,
} from './subject-tag.dto';

export class SubjectDto {
  id: number;
  display_name: string;
  type: SubjectType;
  tags?: SubjectTagDto[];
  short_description?: string;
  long_description?: string;
  created_by?: UserDto;
  created_at?: Date;
  modified_by?: UserDto;
  modified_at?: Date;
}

export type CreateSubjectRequest = Omit<
  UserDto,
  | 'id'
  | 'long_description'
  | 'created_by'
  | 'created_at'
  | 'modified_by'
  | 'modified_at'
> &
  Required<Pick<SubjectDto, 'long_description'>>;

export type UpdateSubjectRequest = Pick<UserDto, 'id'> &
  Partial<CreateSubjectRequest>;

export function SubjectDtoFromEntity(entity: SubjectEntity): SubjectDto {
  return {
    id: entity.id,
    display_name: entity.display_name,
    type: entity.type,
    tags: entity.tags?.map(SubjectTagDtoFromEntity),
    short_description: entity.short_description,
    long_description: entity.long_description,
    created_by: entity.created_by
      ? UserDtoFromEntity(entity.created_by)
      : undefined,
    created_at: entity.created_at,
    modified_by: entity.created_by
      ? UserDtoFromEntity(entity.modified_by)
      : undefined,
    modified_at: entity.modified_at,
  };
}

export function SubjectEntityFromDto(
  dto: SubjectDto,
): DeepPartial<SubjectEntity> {
  return {
    id: dto.id,
    display_name: dto.display_name,
    type: dto.type,
    tags: dto.tags.map(SubjectTagEntityFromDto),
    short_description: dto.short_description,
    long_description: dto.long_description,
    modified_by: dto.modified_by
      ? UserEntityFromDto(dto.modified_by)
      : undefined,
    modified_at: dto.modified_at,
  };
}
