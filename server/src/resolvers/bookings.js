const { AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const Booking = require('../models/booking');
const Notification = require('../models/notification');
const updateBookingMail = require('../utils/sendMail/updateBookingMail');

const bookingsResolvers = {
  Query: {
    bookings: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Get all user's bookings
        const userBookings = await User.aggregate([
          {
            $match: { _id: mongoose.Types.ObjectId(user.userId) },
          },
          {
            $lookup: {
              from: 'bookings',
              let: { bookings: '$bookings' },
              pipeline: [
                { $match: { $expr: { $in: ['$_id', '$$bookings'] } } },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'booker',
                    foreignField: '_id',
                    as: 'booker',
                  },
                },
                { $unwind: '$booker' },
                {
                  $lookup: {
                    from: 'communities',
                    localField: 'community',
                    foreignField: '_id',
                    as: 'community',
                  },
                },
                { $unwind: '$community' },
                {
                  $lookup: {
                    from: 'posts',
                    let: { post: '$post' },
                    pipeline: [
                      { $match: { $expr: { $eq: ['$_id', '$$post'] } } },
                      {
                        $lookup: {
                          from: 'users',
                          localField: 'creator',
                          foreignField: '_id',
                          as: 'creator',
                        },
                      },
                      { $unwind: '$creator' },
                    ],
                    as: 'post',
                  },
                },
                { $unwind: '$post' },
              ],
              as: 'bookings',
            },
          },
          {
            $project: {
              bookings: {
                _id: 1,
                dateNeed: 1,
                dateReturn: 1,
                pickupTime: 1,
                status: 1,
                post: { _id: 1, title: 1, creator: { _id: 1, name: 1 } },
                community: { _id: 1, name: 1 },
                booker: { _id: 1, name: 1 },
                patcher: 1,
              },
            },
          },
        ]);

        console.log(userBookings);

        return userBookings[0].bookings;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    createBooking: async (
      _,
      {
        bookingInput: {
          dateNeed,
          dateReturn,
          status,
          postId,
          ownerId,
          communityId,
        },
      },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId, userName } = user;

      try {
        // Save booking && find post, owner & booker
        const [booking, post, owner, booker] = await Promise.all([
          Booking.create({
            status,
            dateNeed,
            dateReturn,
            post: postId,
            booker: userId,
            patcher: userId,
            community: communityId,
          }),
          Post.findById(postId),
          User.findById(ownerId),
          User.findById(userId),
        ]);

        // Create and save notification
        const notification = await Notification.create({
          onType: 2,
          onDocId: post.id,
          content: `${userName} has requested to book your ${post.title}`,
          recipient: owner.id,
          creator: userId,
          isRead: false,
        });

        // Save booking to post, owner & booker && save notification
        // to the owner
        post.bookings.push(booking);
        booker.bookings.push(booking);
        owner.bookings.push(booking);
        owner.notifications.push(notification);
        await Promise.all([post.save(), booker.save(), owner.save()]);

        return booking;
      } catch (err) {
        console.log(err);
        throw new Error(err);
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
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        // Get booking & recipient
        const [booking, recipient] = await Promise.all([
          Booking.findById(bookingId),
          User.findById(notifyRecipientId),
        ]);

        // Create & save notification
        const notification = await Notification.create({
          onType: 2,
          onDocId: postId,
          content: notifyContent,
          recipient: recipient.id,
          creator: userId,
          isRead: false,
        });

        // Update booking && save booking & add notification to recipient
        // Sent booking update email to recipient if is subscribed
        booking.status = status;
        booking.pickupTime = pickupTime || booking.pickupTime;
        booking.patcher = userId;
        recipient.notifications.push(notification);
        await Promise.all([
          booking.save(),
          recipient.save(),
          recipient.isNotified &&
            updateBookingMail(
              `${process.env.ORIGIN}/bookings`,
              recipient.email,
              notifyContent
            ),
        ]);

        return booking;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = bookingsResolvers;
