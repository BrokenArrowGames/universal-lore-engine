import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { SubjectTagEntity } from './subject-tag.entity';
import { AbstractEntity } from './abstract.entity';
import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator';
import { matchers } from './util/regex';

export enum SubjectType {
  PERSON = 'person',
  PLACE = 'place',
  THING = 'thing',
  IDEA = 'idea',
  EVENT = 'event',
}

@Entity({ schema: 'app', name: 'subject' })
export class SubjectEntity extends AbstractEntity {
  @Column({ default: true })
  private: boolean;

  @Column({ unique: true })
  @MinLength(3, { message: 'Subject key too short' })
  @MaxLength(Math.pow(2, 6), { message: 'Subject key too long' })
  @Matches(matchers.ALNUM_UNDER_DASH_DOT, {
    message: 'Subject key format invalid',
  })
  key: string;

  @Column()
  @MinLength(3, { message: 'Subject name too short' })
  @MaxLength(Math.pow(2, 6), { message: 'Subject name too long' })
  display_name: string;

  @Column({ nullable: true })
  @IsOptional()
  @MinLength(3, { message: 'Subject short description too short' })
  @MaxLength(Math.pow(2, 6), { message: 'Subject short description too long' })
  short_description: string;

  @Column()
  @MinLength(3, { message: 'Subject description too short' })
  @MaxLength(Math.pow(2, 14), { message: 'Subject description too long' })
  long_description: string;

  @Column({ nullable: true })
  @MinLength(3, { message: 'Subject note too short' })
  @MaxLength(Math.pow(2, 14), { message: 'Subject note too long' })
  note: string;

  @Column()
  type: SubjectType;

  @ManyToMany(() => SubjectTagEntity, (tag) => tag.subjects, { cascade: true })
  @JoinTable({
    name: 'subject_tag_mapping',
    joinColumn: { name: 'subject_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags: SubjectTagEntity[];
}
