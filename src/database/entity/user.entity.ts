import {
  IsEmail,
  Matches,
  MaxLength,
  MinLength,
  validateSync,
} from 'class-validator';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeInsert,
  BaseEntity,
  DataSource,
  BeforeUpdate,
} from 'typeorm';
import { matchers } from './util/regex';
import { EntityValidationError } from './util/entity-validation-error';
import { getOrder, Order } from './util/column-order';
import { RoleName } from '@mod/auth/role/types';

@Entity({ schema: 'app', name: 'user' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail({ require_tld: false })
  email: string;

  @Column({ unique: true })
  @MinLength(3, { message: 'User name too short' })
  @MaxLength(Math.pow(2, 14), { message: 'User name too long' })
  @Matches(matchers.ALNUM_UNDER_DASH, { message: 'User name format invalid' })
  name: string;

  @Column({ default: RoleName.USER })
  role: RoleName;

  @Order(9996)
  @Column({ name: 'created_by', nullable: false })
  createdById: number;

  @Order(9996)
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity;

  @Order(9997)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Order(9998)
  @Column({ name: 'modified_by', nullable: false })
  modifiedById: number;

  @Order(9998)
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'modified_by' })
  modifiedBy: UserEntity;

  @Order(9999)
  @UpdateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;

  @BeforeInsert()
  validateInsert() {
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new EntityValidationError(this, errors);
    }
  }

  @BeforeUpdate()
  validateUpdate() {
    const errors = validateSync(this, { skipMissingProperties: true });
    if (errors.length > 0) {
      throw new EntityValidationError(this, errors);
    }
  }

  static useDataSource(dataSource: DataSource) {
    BaseEntity.useDataSource.call(this, dataSource);
    const meta = dataSource.entityMetadatasMap.get(this);
    if (meta != null) {
      // reorder columns here
      meta.columns = [...meta.columns].sort((x, y) => {
        const orderX = getOrder((x.target as any)?.prototype, x.propertyName);
        const orderY = getOrder((y.target as any)?.prototype, y.propertyName);
        return orderX - orderY;
      });
    }
  }
}
