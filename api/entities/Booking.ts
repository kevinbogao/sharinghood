import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User, Post, Community } from "./";
import { TimeFrame, BookingStatus } from "../../lib/types";

@Entity()
export class Booking extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  public status: BookingStatus;

  @Column({
    type: "enum",
    enum: TimeFrame,
    default: TimeFrame.ASAP,
  })
  public timeFrame: TimeFrame;

  @Column("timestamp", { nullable: true })
  public dateNeed?: Date;

  @Column("timestamp", { nullable: true })
  public dateReturn?: Date;

  @Column("uuid", { nullable: true })
  public postId?: string;

  @ManyToOne(() => Post, (post) => post.bookings, { onDelete: "CASCADE" })
  public post: Post;

  @Column("uuid", { nullable: true })
  public bookerId?: string;

  @ManyToOne(() => User, (booker) => booker.bookings)
  public booker: User;

  @Column("uuid", { nullable: true })
  public communityId?: string;

  @ManyToOne(() => Community, (community) => community.bookings)
  public community: Community;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
