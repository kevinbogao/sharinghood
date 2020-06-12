const { AuthenticationError } = require('apollo-server');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const Community = require('../models/community');
const uploadImg = require('../middleware/uploadImg');
const parseCookie = require('../middleware/parseCookie');
const {
  generateToken,
  generateTokens,
  varifyToken,
} = require('../middleware/authToken');

const usersResolvers = {
  Mutation: {
    login: async (_, { email, password }, { res }) => {
      try {
        // Get user
        const user = await User.findOne({ email }).lean();
        if (!user) throw new AuthenticationError('User does not exist');

        // Check user password
        const isEqual = await bcryptjs.compare(password, user.password);
        if (!isEqual) throw new AuthenticationError('Password is incorrect');

        // Sign accessToken & sent refreshToken as cookie
        const accessToken = generateToken(user, true);
        res.cookie('refreshToken', generateToken(user, false), {
          httpOnly: true,
        });

        const something = generateTokens(user, res);
        console.log(something);

        return {
          token: accessToken,
          tokenExpiration: 1,
          userId: user._id,
          userName: user.name,
          communityId: user.community,
        };
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
            isCreator,
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

        // Sign accessToken & sent refreshToken as cookie
        const accessToken = generateToken(user, true);
        res.cookie('refreshToken', generateToken(user, false), {
          httpOnly: true,
        });

        return {
          token: accessToken,
          tokenExpiration: 1,
          userId: user.id,
          userName: user.name,
          communityId: user.community,
        };
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

        // Get userId from token
        const { userId } = varifyToken(refreshToken);

        // If token is valid
        if (userId) {
          // Find user by id
          const user = await User.findOne({ _id: userId }).lean();

          // refresh accessToken & refreshToken
          const accessToken = generateToken(user, true);
          res.cookie('refreshToken', generateToken(user, false), {
            httpOnly: true,
          });
          const something = generateTokens(user, res);
          console.log(something);

          return { isRefreshed: true, accessToken };
        }

        return { isRefreshed: false };
      } catch (err) {
        return { isRefreshed: false };
      }
    },
  },
};

module.exports = usersResolvers;
