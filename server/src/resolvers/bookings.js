const { AuthenticationError } = require('apollo-server');
const User = require('../models/user');
const Post = require('../models/post');
const Booking = require('../models/booking');
const updateBookingMail = require('../utils/sendMail/updateBookingMail');

const bookingsResolvers = {
  Mutation: {
    updateBooking: async (
      _,
      { bookingId, bookingInput: { status, notifyContent, notifyRecipientId } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Find booking and recipient by id
        const [booking, recipient] = await Promise.all([
          Booking.findById(bookingId),
          User.findById(notifyRecipientId).lean(),
        ]);

        // Get post & check if current user is post creator
        // && throw error if not
        const post = await Post.findById(booking.post).lean();
        if (!post.creator.equals(user.userId)) {
          throw new Error('Anauthorised user');
        }

        // Update booking status
        booking.status = status;

        // Save booking & send booking notification email if user is notified
        await Promise.all([
          booking.save(),
          recipient.isNotified &&
            updateBookingMail(
              `${process.env.ORIGIN}/notifications`,
              recipient.email,
              notifyContent
            ),
        ]);

        return booking;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
};

module.exports = bookingsResolvers;
