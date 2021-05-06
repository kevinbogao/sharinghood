import { merge } from "lodash";
import usersResolvers from "./users";
import postsResolvers from "./posts";
import threadsResolvers from "./threads";
import requestsResolvers from "./requests";
import messagesResolvers from "./messages";
import bookingsResolvers from "./bookings";
import activitiesResolvers from "./activities";
import communitiesResolvers from "./communities";
import notificationsResolvers from "./notifications";

const resolvers = merge(
  usersResolvers,
  postsResolvers,
  threadsResolvers,
  requestsResolvers,
  messagesResolvers,
  bookingsResolvers,
  activitiesResolvers,
  communitiesResolvers,
  notificationsResolvers
);

export default resolvers;
