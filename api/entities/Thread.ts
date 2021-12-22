import {
  Entity,
  Column,
  ManyToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Community, User, Post, Request } from "./index";

@Entity()
export class Thread extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  public id: string;

  @Column("varchar", { length: 255 })
  public content: string;

  @Column("uuid", { nullable: true })
  public postId?: string;

  @ManyToOne(() => Post, (post) => post.threads, { onDelete: "CASCADE" })
  post: Post;

  @Column("uuid", { nullable: true })
  public requestId?: string;

  @ManyToOne(() => Request, (request) => request.threads, {
    onDelete: "CASCADE",
  })
  request: Request;

  @Column("uuid", { nullable: true })
  public creatorId?: string;

  @ManyToOne(() => User, (user) => user.threads)
  creator: User;

  @Column("uuid", { nullable: true })
  public communityId?: string;

  @ManyToOne(() => Community, (community) => community.threads)
  community: Community;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
