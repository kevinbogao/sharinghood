const { AuthenticationError } = require('apollo-server');
const User = require('../models/user');
const Post = require('../models/post');
const Booking = require('../models/booking');
const Notification = require('../models/notification');

const bookingsResolvers = {
  Query: {
    bookings: async (_, __, { user, user: { userId } }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const booker = await User.findById(userId);

        // Get bookings and only populate booker.name, post.title
        // & post.creator.name
        const bookings = await Booking.find({
          _id: { $in: booker.bookings },
        })
          .populate('booker', 'name')
          .populate({
            path: 'post',
            select: 'title',
            populate: { path: 'creator', model: 'User', select: 'name' },
          });

        return bookings;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    createBooking: async (
      _,
      { bookingInput: { dateNeed, dateReturn, status, postId, ownerId } },
      { user, user: { userId, userName } }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const booking = new Booking({
          status,
          dateNeed,
          dateReturn,
          post: postId,
          booker: userId,
          patcher: userId,
        });

        const result = await booking.save();

        // Link booking to post, owner & booker
        const post = await Post.findById(postId);
        const owner = await User.findById(ownerId);
        const booker = await User.findById(userId);
        post.bookings.push(post);
        owner.bookings.push(booking);
        booker.bookings.push(booking);
        await post.save();
        await booker.save();

        // Create notification and save it to owner
        const notification = await Notification.create({
          onType: 2,
          onDocId: post.id,
          content: `${userName} has requested to book your ${post.title}`,
          recipient: owner.id,
          creator: userId,
          isRead: false,
        });

        owner.notifications.push(notification);
        await owner.save();

        return result;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    updateBooking: async (
      _,
      {
        bookingId,
        bookingInput: {
          status,
          postId,
          pickupTime,
          notifyContent,
          notifyRecipientId,
        },
      },
      { user, user: { userId } }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        const booking = await Booking.findById(bookingId);

        booking.status = status;
        booking.pickupTime = pickupTime || booking.pickupTime;
        booking.patcher = userId;
        await booking.save();

        // Create notification & save to receiver
        const recipient = await User.findById(notifyRecipientId);
        const notification = await Notification.create({
          onType: 2,
          onDocId: postId,
          content: notifyContent,
          recipient: recipient.id,
          creator: userId,
          isRead: false,
        });

        recipient.notifications.push(notification);
        await recipient.save();

        return booking;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = bookingsResolvers;
