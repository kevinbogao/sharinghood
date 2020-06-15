const { AuthenticationError } = require('apollo-server');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const Community = require('../models/community');
const uploadImg = require('../middleware/uploadImg');
const parseCookie = require('../middleware/parseCookie');
const { generateTokens, verifyToken } = require('../middleware/authToken');

// const sendMail = require('../middleware/sendMail');
// const newCommunityMail = require('../middleware/sendMail/newCommunityMail');
const updateBookingMail = require('../middleware/sendMail/updateBookingMail');

const usersResolvers = {
  Mutation: {
    login: async (_, { email, password }, { res }) => {
      try {
        // Get user
        const user = await User.findOne({ email });
        if (!user) throw new AuthenticationError('User does not exist');

        // Check user password
        const isEqual = await bcryptjs.compare(password, user.password);
        if (!isEqual) throw new AuthenticationError('Password is incorrect');

        // Sign accessToken & sent refreshToken as cookie and
        const accessToken = generateTokens(user, res);

        // Update user's last login date
        user.lastLogin = new Date();
        await user.save();

        return accessToken;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    register: async (
      _,
      {
        userInput: {
          name,
          email,
          password,
          image,
          apartment,
          communityId,
          isNotified,
          isCreator,
        },
      },
      { res }
    ) => {
      try {
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) throw new Error('User exist already');

        // Hash password & upload image to Cloudinary
        const [hashedPassword, imgData] = await Promise.all([
          bcryptjs.hash(password, 12),
          uploadImg(image),
        ]);

        // Create & save new user && get community
        const [user, community] = await Promise.all([
          User.create({
            name,
            email,
            apartment,
            isNotified,
            image: imgData,
            community: communityId,
            password: hashedPassword,
          }),
          Community.findById(communityId),
        ]);

        // Unlikely case
        if (!community) {
          throw new Error('Community does not exist!');
        }

        // Add user to community & save as creator if true
        community.members.push(user);
        if (isCreator) community.creator = user;
        await community.save();

        // Sign accessToken & sent refreshToken as cookie and
        const accessToken = generateTokens(user, res);

        // Update user's last login date
        user.lastLogin = new Date();
        await user.save();

        return accessToken;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    tokenRefresh: async (
      _,
      __,
      {
        req: {
          headers: { cookie },
        },
        res,
      }
    ) => {
      try {
        // Parse cookie string to cookies object
        const { refreshToken } = parseCookie(cookie);

        // Validate token & get userId if token is valid
        const { userId } = verifyToken(refreshToken);

        // If refreshToken is valid
        if (userId) {
          // Find user by id
          const user = await User.findOne({ _id: userId });

          // Refresh accessToken & refreshToken
          const accessToken = generateTokens(user, res);

          // Update user's last login date
          user.lastLogin = new Date();
          await user.save();

          return accessToken;
        }

        // Return empty string on invalid refreshToken
        return '';
      } catch (err) {
        // Return empty string on error
        return '';
      }
    },
    sentMail: async () => {
      const name = 'Kevin';
      // const communityUrl = 'http://localhost:3000/community/1';
      const bookingsUrl = `${process.env.DOMAIN}/bookings`;

      // const info = await newAccountMail(
      //   'https://sharinghood.de',
      //   'Internal Testing',
      //   'k_gao@aol.com',
      //   `Welcome ${name} to Internal Testing Community!`
      // );

      console.log(bookingsUrl);

      const info = await updateBookingMail(
        bookingsUrl,
        'k_gao@aol.com',
        `Booking ${name} to Internal Testing Community!`
      );

      console.log(info);
      // const info = await sendMail();
      // console.log(info);
      // return true;
    },
  },
};

module.exports = usersResolvers;
