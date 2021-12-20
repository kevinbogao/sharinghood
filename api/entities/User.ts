import {
  Entity,
  Column,
  OneToMany,
  BaseEntity,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  Post,
  Community,
  Request,
  Thread,
  Booking,
  Message,
  Notification,
  Token,
} from "./";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column("varchar", { length: 255, unique: true })
  public name: string;

  @Column("varchar", { length: 255, unique: true })
  public email: string;

  @Column("text")
  public password: string;

  @Column("varchar", { length: 255, nullable: true })
  public imageUrl?: string;

  @Column("varchar", { length: 255, nullable: true })
  public desc?: string;

  @Column("varchar", { length: 255, nullable: true })
  public apartment?: string;

  @Column("bool", { default: false })
  public isNotified: boolean;

  @Column("bool", { default: false })
  public isAdmin: boolean;

  @Column("bool", { default: true })
  public isMigrated: boolean;

  @Column("integer", { default: 0 })
  public tokenVersion: number;

  @Column("varchar", { length: 255, unique: true })
  public unsubscribeToken: string;

  @Column({ type: "timestamp", nullable: true })
  public lastLogin?: Date;

  @OneToMany(() => Community, (community) => community.creator)
  public createdCommunity: Community[];

  @OneToMany(() => Post, (post) => post.creator)
  public posts: Post[];

  @OneToMany(() => Request, (request) => request.creator)
  public requests: Request[];

  @OneToMany(() => Thread, (thread) => thread.creator)
  public threads: Thread[];

  @OneToMany(() => Booking, (booking) => booking.booker)
  public bookings: Booking[];

  @OneToMany(() => Message, (message) => message.creator)
  public messages: Booking[];

  @OneToMany(() => Token, (token) => token.owner)
  public tokens: Token[];

  @OneToMany(() => Notification, (notification) => notification.creator)
  public notifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.notifier, {
    cascade: true,
  })
  public notificationNotifies: Notification[];

  @ManyToMany(() => Community, (community) => community.members)
  public communities: Community[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
