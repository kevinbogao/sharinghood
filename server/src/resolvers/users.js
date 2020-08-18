const { AuthenticationError } = require('apollo-server');
const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const Community = require('../models/community');
const uploadImg = require('../utils/uploadImg');
const sendMail = require('../utils/sendMail/index');
const pbkdf2Verify = require('../utils/pbkdf2Verify');
const newAccountMail = require('../utils/sendMail/newAccountMail');
const newCommunityMail = require('../utils/sendMail/newCommunityMail');
const handleErrors = require('../utils/handleErrors');
const { generateTokens, verifyToken } = require('../utils/authToken');

const usersResolvers = {
  Query: {
    user: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Get user data && get user posts & notifications
        const userData = await User.aggregate([
          { $match: { _id: mongoose.Types.ObjectId(user.userId) } },
          {
            $lookup: {
              from: 'posts',
              localField: 'posts',
              foreignField: '_id',
              as: 'posts',
            },
          },
          {
            $lookup: {
              from: 'notifications',
              let: { notifications: '$notifications' },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ['$_id', '$$notifications'] },
                  },
                },
                {
                  $lookup: {
                    from: 'bookings',
                    localField: 'booking',
                    foreignField: '_id',
                    as: 'booking',
                  },
                },
                {
                  $unwind: {
                    path: '$booking',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'notifications',
            },
          },
        ]);

        return userData[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    validateResetLink: async (_, { resetKey }, { redis }) => {
      try {
        // Check if key is still valid
        const userId = await redis.get(`reset_password:${resetKey}`);

        // Return true if user id id found, else return false
        if (userId) return true;
        return false;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    login: async (_, { email, password }) => {
      // Get user by email
      const user = await User.findOne({ email });
      if (!user) throw new AuthenticationError('email: User not found');

      // Re-hash user password if user is not migrated
      if (!user.isMigrated) {
        const isPasswordValid = await pbkdf2Verify(password, user.password);

        // Re-hash password with bcryptjs if password if valid
        if (isPasswordValid) {
          const hashedPassword = await bcryptjs.hash(password, 12);

          // Update user password & migration status
          user.password = hashedPassword;
          user.isMigrated = true;

          // Throw auth error if password is invalid
        } else {
          throw new AuthenticationError('password: Invalid credentials');
        }

        // If user is migrated
      } else {
        // Check user password
        const isEqual = await bcryptjs.compare(password, user.password);
        if (!isEqual) {
          throw new AuthenticationError('password: Invalid credentials');
        }
      }

      // Sign accessToken & refreshToken
      const { accessToken, refreshToken } = generateTokens(user);

      // Update user's last login date
      user.lastLogin = new Date();
      await user.save();

      return { accessToken, refreshToken };
    },
    logout: async (_, __, { user }) => {
      if (!user) return false;

      // Increment user's tokenVersion
      await User.updateOne(
        { _id: user.userId },
        {
          $inc: { tokenVersion: 1 },
        }
      );

      return true;
    },
    registerAndOrCreateCommunity: async (
      _,
      {
        userInput: {
          name,
          email,
          password,
          image,
          apartment,
          isNotified,
          isCreator,
          communityId,
        },
        communityInput,
      }
    ) => {
      try {
        // Get user and check if email exists
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
          throw new AuthenticationError('email: User exist already');
        }

        // Hash password & upload image to Cloudinary
        const [hashedPassword, imgData] = await Promise.all([
          bcryptjs.hash(password, 12),
          uploadImg(image),
        ]);

        // Create and save user, create community if user is create
        // else get community by id
        const [user, community] = await Promise.all([
          User.create({
            name,
            email,
            apartment,
            isNotified,
            image: imgData,
            password: hashedPassword,
            lastLogin: new Date(),
          }),
          isCreator
            ? Community.create({
                name: communityInput.name,
                code: communityInput.code,
                zipCode: communityInput.zipCode,
              })
            : Community.findById(communityId),
        ]);

        // Add user as creator to community if isCreator if true,
        // ddd community to user, and user to community members
        if (isCreator) community.creator = user._id;
        user.communities.push(community._id);
        community.members.push(user._id);

        // Save user and community
        await Promise.all([
          user.save(),
          community.save(),

          // Sent new account mail if user is notified
          process.env.NODE_ENV === 'production' &&
            isNotified &&
            newAccountMail(
              `${process.env.ORIGIN}/share`,
              community.name,
              user.email,
              'Welcome to Sharinghood'
            ),

          // Sent new community mail if user is notified & isCreator
          process.env.NODE_ENV === 'production' &&
            isNotified &&
            isCreator &&
            newCommunityMail(
              `${process.env.ORIGIN}/community/${community.code}`,
              user.email,
              `Welcome tips for your new ${community.name} community`
            ),
        ]);

        // Sign accessToken & refreshToken
        const { accessToken, refreshToken } = generateTokens(user);

        return {
          user: {
            accessToken,
            refreshToken,
          },
          ...(isCreator && { community }),
        };
      } catch (err) {
        handleErrors(err);
        throw err;
      }
    },
    updateUser: async (
      _,
      { userInput: { name, image, apartment } },
      { user }
    ) => {
      if (!user) throw new AuthenticationError('Not Authenticated');
      const { userId } = user;

      try {
        // Get user from database
        const userData = await User.findById(userId);

        // Upload image if it exists
        let imgData;
        if (image) imgData = await uploadImg(image);

        // Conditionally update user
        if (name) userData.name = name;
        if (image && imgData) userData.image = imgData;
        if (apartment) userData.apartment = apartment;

        // Save to user
        const updatedUser = await userData.save();
        return updatedUser;
      } catch (err) {
        throw new Error(err);
      }
    },
    tokenRefresh: async (_, { token }) => {
      try {
        // Validate token
        const tokenPayload = verifyToken(token);

        // Throw auth error if token is invalid or userId is not included
        if (!tokenPayload || !tokenPayload.userId) {
          throw new AuthenticationError('Please login again');
        }

        // Find user by id
        const user = await User.findOne({ _id: tokenPayload.userId });

        // Throw auth error if token's verison is not the same as user's tokenVersion
        if (tokenPayload.tokenVersion !== user.tokenVersion) {
          throw new AuthenticationError('Please login again');
        }

        // Refresh accessToken & refreshToken
        const { accessToken, refreshToken } = generateTokens(user);

        // Update user's last login date
        user.lastLogin = new Date();
        await user.save();

        return { accessToken, refreshToken };
      } catch (err) {
        handleErrors(err);
        throw err;
      }
    },
    forgotPassword: async (_, { email }, { redis }) => {
      try {
        // Find user by email & check if reset_key exists
        const [user, existingResetKey] = await Promise.all([
          await User.findOne({ email }).lean(),
          await redis.get(`reset_key:${email}`),
        ]);

        // Throw error if user is not found
        if (!user) throw new AuthenticationError('email: User not found');

        // Create and send reset password link to email if existing resetkey is not found
        if (!existingResetKey) {
          // Generate random reset key
          const resetKey = crypto.randomBytes(16).toString('hex');

          // Save reset_password key & reset_key in redis cache && send reset link to user
          await Promise.all([
            redis.set(
              `reset_password:${resetKey}`,
              user._id,
              'ex',
              60 * 60 * 24
            ),
            redis.set(`reset_key:${email}`, resetKey, 'ex', 60 * 60 * 2),
            sendMail(
              user.email,
              'Reset your Sharinghood password',
              `${process.env.ORIGIN}/reset-password/${resetKey}`
            ),
          ]);

          return true;
        }

        // Re-send reset link if existing resetkey is found
        await sendMail(
          email,
          'Reset your Sharinghood password',
          `${process.env.ORIGIN}/reset-password/${existingResetKey}`
        );

        return true;
      } catch (err) {
        handleErrors(err);
        throw err;
      }
    },
    resetPassword: async (_, { resetKey, password }, { redis }) => {
      try {
        // Get userId via resetKey from redis & hash user password
        const [userId, hashedPassword] = await Promise.all([
          redis.get(`reset_password:${resetKey}`),
          bcryptjs.hash(password, 12),
        ]);

        // Update user's password & migration status
        const user = await User.findById(userId);
        user.password = hashedPassword;
        user.isMigrated = true;

        // Save user && delete reset_password key & reset_key in redis cache
        await Promise.all([
          user.save(),
          redis.del(`reset_password:${resetKey}`),
          redis.del(`reset_key:${user.email}`),
        ]);

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
    addFcmToken: async (_, { fcmToken }, { user }) => {
      if (!user) throw new AuthenticationError('Not Authenticated');

      try {
        // Add FCM token to user's fcmTokens array
        await User.updateOne(
          {
            _id: user.userId,
          },
          // $addToSet ensures no duplications
          { $addToSet: { fcmTokens: fcmToken } }
        );

        return true;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
};

module.exports = usersResolvers;
