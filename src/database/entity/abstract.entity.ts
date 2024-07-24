import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  DataSource,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order, getOrder } from './util/column-order';
import { UserEntity } from './user.entity';
import { validateSync } from 'class-validator';
import { EntityValidationError } from './util/entity-validation-error';

export abstract class AbstractEntity extends BaseEntity {
  @Order(-1)
  @PrimaryGeneratedColumn()
  id: number;

  @Order(9996)
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  created_by: UserEntity;

  @Order(9997)
  @CreateDateColumn()
  created_at: Date;

  @Order(9998)
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'modified_by' })
  modified_by: UserEntity;

  @Order(9999)
  @UpdateDateColumn()
  modified_at: Date;

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
