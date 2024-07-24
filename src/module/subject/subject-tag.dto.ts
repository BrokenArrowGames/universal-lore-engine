import { SubjectTagEntity } from '@db/entity/subject-tag.entity';

export class SubjectTagDto {
  id: number;
  name: string;
}

export function SubjectTagDtoFromEntity(
  entity: SubjectTagEntity,
): SubjectTagDto {
  return {
    id: entity.id,
    name: entity.name,
  };
}

export function SubjectTagEntityFromDto(
  dto: SubjectTagDto,
): Partial<SubjectTagEntity> {
  return {
    id: dto.id,
    name: dto.name,
  };
}
