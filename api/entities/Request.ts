import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User, Thread, Community } from "./";
import { TimeFrame } from "../../lib/enums";

@Entity()
export class Request extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column("varchar", { length: 255 })
  public title: string;

  @Column("varchar", { length: 255 })
  public desc: string;

  @Column("varchar", { length: 255 })
  public imageUrl: string;

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

  @OneToMany(() => Thread, (thread) => thread.request)
  public threads: Thread[];

  @Column("uuid", { nullable: true })
  public creatorId?: string;

  @ManyToOne(() => User, (creator) => creator.requests)
  public creator: User;

  @Column("uuid", { nullable: true })
  public communityId?: string;

  @ManyToOne(() => Community, (community) => community.requests)
  public community: Community;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
