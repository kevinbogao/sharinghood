import {
  Index,
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User, Post, Thread, Request, Booking, Notification } from "./index";

@Entity()
export class Community extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column("varchar", { length: 255, unique: true })
  public name: string;

  @Index({ unique: true })
  @Column("varchar", { length: 255, unique: true })
  public code: string;

  @Index()
  @Column("varchar", { length: 255, nullable: true })
  public zipCode: string;

  @Column("text", { nullable: true })
  public password: string;

  @Column("uuid", { nullable: true })
  public creatorId?: string;

  @ManyToOne(() => User, (creator) => creator.createdCommunity)
  public creator: User;

  @OneToMany(() => Thread, (thread) => thread.community)
  public threads: Thread[];

  @OneToMany(() => Request, (request) => request.community)
  public requests: Request[];

  @OneToMany(() => Booking, (booking) => booking.community)
  public bookings: Booking[];

  @OneToMany(() => Notification, (notification) => notification.community)
  public notifications: Notification[];

  @ManyToMany(() => User, (user) => user.communities)
  @JoinTable()
  public members: User[];

  @ManyToMany(() => Post, (post) => post.communities)
  @JoinTable()
  public posts: Post[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
