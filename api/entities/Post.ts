import {
  Index,
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  BaseEntity,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User, Thread, Booking, Community } from "./";
import { ItemCondition } from "../../lib/enums";

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Index()
  @Column("varchar", { length: 255 })
  public title: string;

  @Column("varchar", { length: 255 })
  public desc: string;

  @Column({
    type: "enum",
    enum: ItemCondition,
    default: ItemCondition.NEW,
  })
  public condition: ItemCondition;

  @Column("varchar", { length: 255 })
  public imageUrl: string;

  @Column("bool", { default: false })
  public isGiveaway: boolean;

  @Column("uuid", { nullable: true })
  public creatorId?: string;

  @ManyToOne(() => User, (creator) => creator.posts)
  public creator: User;

  @OneToMany(() => Thread, (thread) => thread.post)
  public threads: Thread[];

  @OneToMany(() => Booking, (booking) => booking.post)
  public bookings: Booking[];

  @ManyToMany(() => Community, (community) => community.posts)
  public communities: Community[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
