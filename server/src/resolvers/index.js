const { merge } = require("lodash");
const usersResolvers = require("./users");
const postsResolvers = require("./posts");
const threadsResolvers = require("./threads");
const requestsResolvers = require("./requests");
const messagesResolvers = require("./messages");
const bookingsResolvers = require("./bookings");
const activitiesResolvers = require("./activities");
const communitiesResolvers = require("./communities");
const notificationsResolvers = require("./notifications");

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

module.exports = resolvers;
