const { merge } = require('lodash');
const usersResolvers = require('./users');
const chatsResolvers = require('./chats');
const postsResolvers = require('./posts');
const threadsResolvers = require('./threads');
const requestsResolvers = require('./requests');
const messagesResolvers = require('./messages');
const bookingsResolvers = require('./bookings');
const communitiesResolvers = require('./communities');
const notificationsResolvers = require('./notifications');

const resolvers = merge(
  usersResolvers,
  postsResolvers,
  chatsResolvers,
  threadsResolvers,
  requestsResolvers,
  messagesResolvers,
  bookingsResolvers,
  communitiesResolvers,
  notificationsResolvers
);

module.exports = resolvers;
