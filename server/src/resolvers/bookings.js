const { AuthenticationError } = require('apollo-server');
const User = require('../models/user');
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
          User.findById(notifyRecipientId),
        ]);

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
