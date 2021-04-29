import { Schema } from "mongoose";

export interface UserContext {
  userId: Schema.Types.ObjectId;
  userName: string;
  email: string;
  isAdmin?: boolean;
  iat: number;
  exp: number;
}
