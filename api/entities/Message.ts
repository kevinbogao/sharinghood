import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User, Notification } from "./";

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column("varchar", { length: 255 })
  public content: string;

  @Column("uuid", { nullable: true })
  public creatorId?: string;

  @ManyToOne(() => User, (creator) => creator.messages)
  public creator: User;

  @Column("uuid", { nullable: true })
  public notificationId?: string;

  @ManyToOne(() => Notification, (notification) => notification.messages)
  public notification: Notification;

  @CreateDateColumn()
  public createdAt: Date;
}
