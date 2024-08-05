import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { FilterQuery } from "@util/filter-query";
import { SubjectTagDto, SubjectTagDtoFromEntity } from "./subject-tag.dto";
import { SubjectTagEntity } from "@db/entity/subject-tag.entity";

export type SubjectTagFilter = FilterQuery<SubjectTagDto, "name">;

@Injectable()
export class SubjectTagService {
  constructor(
    @InjectRepository(SubjectTagEntity)
    private readonly subjectTagRepo: Repository<SubjectTagEntity>,
  ) {}

  public async getFilteredSubjectTags(
    filterQuery: SubjectTagFilter,
  ): Promise<SubjectTagDto[]> {
    const entities = await this.subjectTagRepo.findBy({
      name: filterQuery.name ? In(filterQuery.name.split(",")) : null,
    });
    return entities.map(SubjectTagDtoFromEntity);
  }
}
