const { AuthenticationError } = require('apollo-server');
const { v4: uuidv4 } = require('uuid');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const Community = require('../models/community');
const uploadImg = require('../middleware/uploadImg');
const { generateTokens, verifyToken } = require('../middleware/authToken');
const sendMail = require('../middleware/sendMail/index');
const newAccountMail = require('../middleware/sendMail/newAccountMail');
const newCommunityMail = require('../middleware/sendMail/newCommunityMail');
const pbkdf2Verify = require('../utils/pbkdf2Verify');

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
        throw new Error(err);
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
    login: async (_, { email, password }) => {
      try {
        // Get user
        const user = await User.findOne({ email });
        if (!user) throw new AuthenticationError('User does not exist');

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
            throw new AuthenticationError('Password is incorrect');
          }

          // If user is migrated
        } else {
          // Check user password
          const isEqual = await bcryptjs.compare(password, user.password);
          if (!isEqual) throw new AuthenticationError('Password is incorrect');
        }

        // Sign accessToken & refreshToken
        const { accessToken, refreshToken } = generateTokens(user);

        // Update user's last login date
        user.lastLogin = new Date();
        await user.save();

        return { accessToken, refreshToken };
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
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
        if (existingUser) throw new Error('User exist already');

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
        if (isCreator) {
          community.creator = user._id;
        }
        user.community = community._id;
        community.members.push(user._id);

        // Save user and community
        await Promise.all([
          user.save(),
          community.save(),

          // Sent new account mail if user is notified
          isNotified &&
            newAccountMail(
              `${process.env.ORIGIN}/share`,
              community.name,
              user.email,
              'Welcome to Sharinghood'
            ),

          // Sent new community mail if user is notified & isCreator
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
    tokenRefresh: async (_, { token }) => {
      try {
        // Validate token & get userId if token is valid
        const { userId } = verifyToken(token);

        // If token is valid
        if (userId) {
          // Find user by id
          const user = await User.findOne({ _id: userId });

          // Refresh accessToken & refreshToken
          const { accessToken, refreshToken } = generateTokens(user);

          // Update user's last login date
          user.lastLogin = new Date();
          await user.save();

          return { accessToken, refreshToken };
        }

        throw new AuthenticationError('Please login again');
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    },
    forgotPassword: async (_, { email, accessKey }, { redis }) => {
      try {
        // When accessKey is not entered as an argument, i.e. when
        // user is not in the resent page
        if (!accessKey) {
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
              'Reset your Sharinghood password',
              `${process.env.DOMAIN}/reset-password/${userIdKey}`
            ),
          ]);

          // Return uuidKey onSuccess
          return uuidKey;
        }

        // Else get userIdKey
        const userIdKey = await redis.get(accessKey);

        // Resend reset email
        await sendMail(
          email,
          'Reset your Sharinghood password',
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
