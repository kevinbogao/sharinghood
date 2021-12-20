import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./";

@Entity()
export class Token {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column("varchar", { length: 255, unique: true })
  public firebase: string;

  @Column("uuid", { nullable: true })
  public ownerId: string;

  @ManyToOne(() => User, (owner) => owner.tokens)
  public owner: User;
}
