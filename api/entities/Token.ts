import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./";

@Entity()
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column("varchar", { length: 255, unique: true })
  public firebase: string;

  @Column("uuid", { nullable: true })
  public ownerId: string;

  @ManyToOne(() => User, (owner) => owner.tokens)
  public owner: User;
}
