export interface PostInput {
  postId?: mongoose.Schema.Types.ObjectId;
  title: string;
  desc: string;
  image: any;
  condition: number;
  isGiveaway?: boolean;
  requesterId?: string;
}
