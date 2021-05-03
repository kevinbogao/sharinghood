import { Document, Schema, Types, model } from "mongoose";
import { PostDocument } from "./post";
import { UserDocument } from "./user";
import { BookingDocument } from "./booking";
import { MessageDocument } from "./message";
import { CommunityDocument } from "./community";

interface NotificationBaseDocument {
  ofType: number;
  post?: Types.ObjectId | PostDocument;
  booking?: Types.ObjectId | BookingDocument;
  community: Types.ObjectId | CommunityDocument;
  messages: Array<Types.ObjectId | MessageDocument>;
  participants: Array<Types.ObjectId | UserDocument>;
  isRead: {
    [userId: string]: boolean;
  };
}

export interface NotificationDocument
  extends NotificationBaseDocument,
    Document {}

const notificationSchema: Schema = new Schema(
  {
    // 0: Chats
    // 1: Bookings
    // 2: Requests
    ofType: {
      type: Number,
      required: true,
    },

    // For ofType 1
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },

    // For ofType 2
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },

    // All messages associated with booking or chat
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    // User participated in the notification model
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Notification read status
    isRead: Schema.Types.Mixed,

    // Notification community
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
  },
  { timestamps: true }
);

// Compound index for ofType, participants & community
notificationSchema.index({ ofType: 1, participants: 1, community: 1 });

// Secondary index for community
notificationSchema.index({ community: 1 });

// Secondary index for booking
notificationSchema.index({ booking: 1 });

// Secondary index for post
notificationSchema.index({ post: 1 });

export default model<NotificationDocument>("Notification", notificationSchema);
