import { Entity, Column, ManyToMany } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { SubjectEntity } from "./subject.entity";
import { Matches, MaxLength, MinLength } from "class-validator";
import { matchers } from "./util/regex";

// http://howto.philippkeller.com/2005/04/24/Tags-Database-schemas/
@Entity({ schema: "app", name: "subject_tag" })
export class SubjectTagEntity extends AbstractEntity {
  @Column({ unique: true })
  @MinLength(3, { message: "Tag too short" })
  @MaxLength(Math.pow(2, 4), { message: "Tag too long" })
  @Matches(matchers.ALNUM_UNDER, { message: "Tag format invalid" })
  name: string;

  @ManyToMany(() => SubjectEntity, (subject) => subject.tags)
  subjects: SubjectEntity[];
}
