import { merge } from "lodash";
import userResolvers from "./users";
import postResolvers from "./posts";
import threadResolvers from "./threads";
import requestResolvers from "./requests";
import bookingResolvers from "./bookings";
import messageResolvers from "./messages";
import activityResolvers from "./activities";
import communityResolvers from "./communities";
import notificationResolvers from "./notifications";

export default merge(
  userResolvers,
  postResolvers,
  threadResolvers,
  requestResolvers,
  bookingResolvers,
  messageResolvers,
  activityResolvers,
  communityResolvers,
  notificationResolvers
);
