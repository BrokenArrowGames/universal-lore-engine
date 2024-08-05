import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  DataSource,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Order, getOrder } from "./util/column-order";
import { UserEntity } from "./user.entity";
import { validateSync } from "class-validator";
import { EntityValidationError } from "./util/entity-validation-error";

export abstract class AbstractEntity extends BaseEntity {
  @Order(-1)
  @PrimaryGeneratedColumn()
  id: number;

  @Order(9995)
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: "created_by" })
  createdBy: UserEntity;

  @Order(9996)
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @Order(9997)
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: "modified_by" })
  modifiedBy: UserEntity;

  @Order(9998)
  @UpdateDateColumn({ name: "modified_at" })
  modifiedAt: Date;

  @Order(9999)
  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;

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
