const { AuthenticationError } = require('apollo-server');
const { v4: uuidv4 } = require('uuid');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const Community = require('../models/community');
const uploadImg = require('../middleware/uploadImg');
const parseCookie = require('../middleware/parseCookie');
const { generateTokens, verifyToken } = require('../middleware/authToken');
const sendMail = require('../middleware/sendMail/index');
const newAccountMail = require('../middleware/sendMail/newAccountMail');
const newCommunityMail = require('../middleware/sendMail/newCommunityMail');

const usersResolvers = {
  Query: {
    getUser: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        // Get user data
        const userData = await User.findById(userId);

        return userData;
      } catch (err) {
        console.log(err);
      }
    },
    validateResetLink: async (_, { userIdKey }, { redis }) => {
      try {
        // Check if key is still valid
        const userId = await redis.get(userIdKey);
        if (userId) return true;
        return false;
        // return userId ? true : false;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
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
            lastLogin: new Date(),
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

        // Save commnity &&
        // Send new account mail & send community mail if user is creator
        // only if user is notified
        await Promise.all([
          community.save(),
          isNotified &&
            newAccountMail(
              `${process.env.ORIGIN}/share`,
              community.name,
              user.email,
              'Welcome to Sharinghood'
            ),
          isNotified &&
            isCreator &&
            newCommunityMail(
              `${process.env.ORIGIN}/community/${community.code}`,
              user.email,
              `Welcome tips for your new ${community.name} community`
            ),
        ]);

        // Sign accessToken & sent refreshToken as cookie and
        const accessToken = generateTokens(user, res);

        return accessToken;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    updateUser: async (
      _,
      { userInput: { name, image, apartment } },
      { user }
    ) => {
      const { userId } = user;
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Get user from database
        const userData = await User.findById(userId);

        // Upload image if it exists
        let imgData;
        if (image) imgData = await uploadImg(image);

        // Conditionally update user
        if (name) userData.name = name;
        if (image && imgData) userData.imgData = imgData;
        if (apartment) userData.apartment = apartment;

        // Save to user
        const updatedUser = await userData.save();
        return updatedUser;
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
    forgotPassword: async (_, { email, uuidKey }, { redis }) => {
      try {
        // When uuidKey is not entered as an argument, i.e. when
        // user is not in the resent page
        if (!uuidKey) {
          const user = await User.findOne({ email }).lean();
          if (!user) throw new AuthenticationError('Cannot find email');

          // Generate uuid key for userId and key for the generated uuidKey
          const userIdKey = uuidv4();
          const uuidKey = uuidv4();

          // Save userIdKey & uuidKey in redis cache && send email to user
          await Promise.all([
            redis.set(userIdKey, user._id, 'ex', 60 * 60 * 48),
            redis.set(uuidKey, userIdKey, 'ex', 60 * 60 * 48),
            sendMail(
              user.email,
              'Reset your Sharedhood password',
              `${process.env.DOMAIN}/reset-password/${userIdKey}`
            ),
          ]);

          // Return uuidKey onSuccess
          return uuidKey;
        }

        // Else get userIdKey
        const userIdKey = await redis.get(uuidKey);

        // Resend reset email
        await sendMail(
          email,
          'Reset your Sharedhood password',
          `${process.env.DOMAIN}/reset-password/${userIdKey}`
        );

        // Return empty array for resend email
        return '';
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    resetPassword: async (_, { userIdKey, password }, { redis }) => {
      try {
        // Get userId via userIdKey from redis & hash user password
        const [userId, hashedPassword] = await Promise.all([
          redis.get(userIdKey),
          bcryptjs.hash(password, 12),
        ]);

        // Update user's password & delete userIdKey
        await Promise.all([
          User.findOneAndUpdate(
            { _id: userId },
            {
              password: hashedPassword,
            }
          ),
          redis.del(userIdKey),
        ]);

        return true;
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
  },
};

module.exports = usersResolvers;
