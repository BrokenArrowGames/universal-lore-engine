import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from "typeorm";
import { ISession } from "connect-typeorm";

@Entity({ schema: "app", name: "session" })
export class SessionEntity implements ISession {
  @Index()
  @Column("bigint")
  public expiredAt = Date.now();

  @PrimaryColumn("varchar", { length: 255 })
  public id = "";

  @Column("text")
  public json = "";

  @DeleteDateColumn()
  public destroyedAt?: Date;
}
