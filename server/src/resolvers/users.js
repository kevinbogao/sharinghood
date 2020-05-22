const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const Community = require('../models/community');
const uploadImg = require('../middleware/uploadImg');

const usersResolvers = {
  Mutation: {
    register: async (
      _,
      {
        userInput: {
          name,
          email,
          password,
          picture,
          apartment,
          communityId,
          isNotified,
          isCreator,
        },
      }
    ) => {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('User exist already');
        }

        const hashedPassword = await bcryptjs.hash(password, 12);
        const imgUrl = await uploadImg(picture);
        const user = new User({
          name,
          email,
          isCreator,
          apartment,
          isNotified,
          picture: imgUrl,
          community: communityId,
          password: hashedPassword,
        });
        const result = await user.save();

        const community = await Community.findById(communityId);
        // Unlikely case
        if (!community) {
          throw new Error('Community does not exist!');
        }
        community.members.push(user);
        if (isCreator) {
          community.creator = user;
        }
        await community.save();

        const token = jwt.sign(
          {
            userId: result.id,
            userName: result.name,
            email: result.email,
            communityId: result.community,
          },
          process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );

        return {
          token,
          tokenExpiration: 1,
          userId: result.id,
          userName: result.name,
          communityId: result.community,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) throw new AuthenticationError('User does not exist');

        const isEqual = await bcryptjs.compare(password, user.password);
        if (!isEqual) throw new AuthenticationError('Password is incorrect');

        const token = jwt.sign(
          {
            userId: user.id,
            userName: user.name,
            email: user.email,
            communityId: user.community,
          },
          process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );

        return {
          token,
          tokenExpiration: 1,
          userId: user.id,
          userName: user.name,
          communityId: user.community,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

module.exports = usersResolvers;
