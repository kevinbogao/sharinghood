import {
  Entity,
  Column,
  OneToOne,
  BaseEntity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User, Post, Community, Message, Booking } from "./";
import { NotificationType } from "../../lib/types";

@Entity()
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  public type: NotificationType;

  @OneToMany(() => Message, (message) => message.notification, {
    onDelete: "CASCADE",
  })
  public messages: Message[];

  @OneToOne(() => Booking, { onDelete: "CASCADE" })
  @JoinColumn()
  public booking?: Booking;

  @Column("uuid", { nullable: true })
  public postId?: string;

  @OneToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn()
  public post?: Post;

  @Column("uuid", { nullable: true })
  public creatorId?: string;

  @ManyToOne(() => User, (user) => user.notifications)
  public creator: User;

  @Column("uuid", { nullable: true })
  public recipientId?: string;

  @ManyToOne(() => User, (user) => user.notifications)
  public recipient: User;

  @Column("uuid", { nullable: true })
  public communityId?: string;

  @ManyToOne(() => Community, (community) => community.notifications)
  public community: Community;

  @Column("uuid", { nullable: true })
  public notifierId?: string | null;

  @ManyToOne(() => User, (user) => user.notifications, { nullable: true })
  public notifier: User;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
