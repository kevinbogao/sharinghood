import { ApolloError, AuthenticationError } from "apollo-server-koa";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { Redis } from "ioredis";
import { Types } from "mongoose";
import User, { UserDocument } from "../models/user";
import { PostDocument } from "../models/post";
import Community, { CommunityDocument } from "../models/community";
import { CommunityInput } from "./communities";
import {
  generateTokens,
  verifyToken,
  GeneratedTokens,
  UserTokenContext,
  RefreshTokenPayload,
} from "../utils/authToken";
import uploadImg from "../utils/uploadImg";
import handleErrors from "../utils/handleErrors";
import pbkdf2Verify from "../utils/pbkdf2Verify";
import newAccountMail from "../utils/sendMail/newAccountMail";
import newCommunityMail from "../utils/sendMail/newCommunityMail";
import resetPasswordMail from "../utils/sendMail/resetPasswordMail";

interface UserInput {
  name: string;
  email: string;
  password: string;
  image: string;
  desc: string;
  apartment: string;
  communityId: string;
  isNotified: boolean;
  isCreator: boolean;
}

const usersResolvers = {
  Query: {
    user: async (
      _: unknown,
      { userId, communityId }: { userId: string; communityId: string },
      { user }: { user: UserTokenContext }
    ): Promise<UserDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

      try {
        let posts: Array<PostDocument | Types.ObjectId> | undefined;

        // Get the community's posts if userId is given
        if (userId) {
          const community = await Community.findById(communityId);
          if (community) posts = community.posts;
        }

        // Get user data && get user posts & notifications
        // If userId is given only match user's posts from given community
        const userData: Array<UserDocument> = await User.aggregate([
          { $match: { _id: Types.ObjectId(userId || user.userId) } },
          {
            $lookup: {
              from: "posts",
              let: { posts: "$posts" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      ...(userId
                        ? // Match post id in user's posts and community's posts is userId is given
                          {
                            $and: [
                              { $in: ["$_id", "$$posts"] },
                              { $in: ["$_id", posts] },
                            ],
                          }
                        : // Else only match ids in user's posts
                          { $in: ["$_id", "$$posts"] }),
                    },
                  },
                },
              ],
              as: "posts",
            },
          },
          {
            $lookup: {
              from: "notifications",
              let: { notifications: "$notifications" },
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$_id", "$$notifications"] },
                  },
                },
                {
                  $lookup: {
                    from: "bookings",
                    localField: "booking",
                    foreignField: "_id",
                    as: "booking",
                  },
                },
                {
                  $unwind: {
                    path: "$booking",
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: "notifications",
            },
          },
        ]);

        return userData[0];
      } catch (err) {
        throw new Error(err);
      }
    },
    validateResetLink: async (
      _: unknown,
      { resetKey }: { resetKey: string },
      { redis }: { redis: Redis }
    ): Promise<boolean> => {
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
    unsubscribeUser: async (
      _: unknown,
      { userId, token }: { userId: string; token: string },
      { redis }: { redis: Redis }
    ): Promise<boolean> => {
      try {
        // Find unsubscribeToken from redis
        const unsubscribeToken = await redis.get(`unsubscribe_token:${userId}`);

        // Set user's isNotify to false if token exists & it's same as
        // input token
        if (unsubscribeToken && unsubscribeToken === token) {
          await redis.del(`unsubscribe_token:${userId}`);
          await User.updateOne({ _id: userId }, { isNotified: false });
          return true;
        }

        return false;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    login: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      // Get user by email
      const user: UserDocument | null = await User.findOne({ email });
      if (!user) throw new AuthenticationError("email: User not found");

      // Re-hash user password if user is not migrated
      if (!user.isMigrated) {
        const isPasswordValid = await pbkdf2Verify(password, user.password);

        // Re-hash password with bcryptjs if password if valid
        if (isPasswordValid) {
          const hashedPassword: string = await bcryptjs.hash(password, 12);

          // Update user password & migration status
          user.password = hashedPassword;
          user.isMigrated = true;

          // Throw auth error if password is invalid
        } else {
          throw new AuthenticationError("password: Invalid credentials");
        }

        // If user is migrated
      } else {
        // Check user password
        const isEqual = await bcryptjs.compare(password, user.password);
        if (!isEqual) {
          throw new AuthenticationError("password: Invalid credentials");
        }
      }

      // Sign accessToken & refreshToken
      const {
        accessToken,
        refreshToken,
      }: { accessToken: string; refreshToken: string } = generateTokens(user);

      // Update user's last login date
      user.lastLogin = new Date();
      await user.save();

      return { accessToken, refreshToken };
    },
    logout: async (
      _: unknown,
      __: unknown,
      { user }: { user: UserTokenContext }
    ): Promise<boolean> => {
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
      _: unknown,
      {
        userInput: {
          name,
          email,
          password,
          image,
          desc,
          apartment,
          isNotified,
          isCreator,
          communityId,
        },
        communityInput,
      }: { userInput: UserInput; communityInput: CommunityInput }
    ): Promise<{
      user: GeneratedTokens;
      community?: CommunityDocument | null | undefined;
    }> => {
      try {
        // Get user and check if email exists
        const existingUser: UserDocument | null = await User.findOne({
          email,
        }).lean();
        if (existingUser) {
          throw new AuthenticationError("email: User exist already");
        }

        // Hash password & upload image to Cloudinary
        const [hashedPassword, imgData] = await Promise.all([
          bcryptjs.hash(password, 12),
          uploadImg(image),
        ]);

        // Create and save user, create community if user is create
        // else get community by id
        let community: CommunityDocument | null;
        const user: UserDocument = await User.create({
          name,
          email,
          ...(desc && { desc }),
          ...(apartment && { apartment }),
          isNotified,
          image: imgData,
          password: hashedPassword,
          lastLogin: new Date(),
        });

        if (isCreator) {
          community = await Community.create({
            name: communityInput.name,
            code: communityInput.code,
            zipCode: communityInput.zipCode,
            creator: user._id,
          });
        } else community = await Community.findById(communityId);

        // Delete user and return error if community is not found
        if (!community) {
          User.deleteOne({ _id: user._id });
          throw new ApolloError(
            "Could not find community, user cannot be created"
          );
        }

        // Add user as creator to community if isCreator if true,
        // ddd community to user, and user to community members
        user.communities.push(community._id);
        community.members.push(user._id);

        // Save user and community
        await user.save();
        await community.save();

        // Sent new account mail if user is notified
        if (process.env.NODE_ENV === "production" && isNotified) {
          await newAccountMail({
            confirmationUrl: `${process.env.ORIGIN}/share`,
            communityName: community.name,
            recipientId: user._id as string,
            to: user.email,
            subject: "Welcome to Sharinghood",
          });

          // Sent new community mail if user is notified & isCreator
          if (isCreator) {
            await newCommunityMail({
              communityUrl: `${process.env.ORIGIN}/community/${community.code}`,
              recipientId: user._id as string,
              to: user.email,
              subject: `Welcome tips for your new ${community.name} community`,
            });
          }
        }

        // Sign accessToken & refreshToken
        const { accessToken, refreshToken }: GeneratedTokens =
          generateTokens(user);

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
      _: unknown,
      {
        userInput: { name, image, desc, apartment, isNotified },
      }: { userInput: UserInput },
      { user }: { user: UserTokenContext }
    ): Promise<UserDocument> => {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const { userId }: { userId: string } = user;

      try {
        // Get user from database
        const userData: UserDocument | null = await User.findById(userId);
        if (!userData) throw new ApolloError("User not found");

        // Upload image if it exists
        let imgData: string | undefined;
        if (image) imgData = await uploadImg(image);

        // Conditionally update user
        if (name) userData.name = name;
        if (image && imgData) userData.image = imgData;
        if (desc) userData.desc = desc;
        if (apartment) userData.apartment = apartment;
        if (isNotified !== undefined) userData.isNotified = isNotified;

        // Save to user
        const updatedUser: UserDocument = await userData.save();
        return updatedUser;
      } catch (err) {
        throw new Error(err);
      }
    },
    tokenRefresh: async (
      _: unknown,
      { token }: { token: string }
    ): Promise<GeneratedTokens> => {
      try {
        // Validate token
        const tokenPayload = verifyToken(token) as RefreshTokenPayload | null;

        // Throw auth error if token is invalid or userId is not included
        if (!tokenPayload || !tokenPayload.userId) {
          throw new AuthenticationError("Please login again");
        }

        // Find user by id
        const user: UserDocument | null = await User.findOne({
          _id: tokenPayload.userId,
        });
        if (!user) throw new ApolloError("User not found");

        // Throw auth error if token's version is not the same as user's tokenVersion
        if (tokenPayload.tokenVersion !== user.tokenVersion) {
          throw new AuthenticationError("Please login again");
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
    forgotPassword: async (
      _: unknown,
      { email }: { email: string },
      { redis }: { redis: Redis }
    ): Promise<boolean> => {
      try {
        // Find user by email & check if reset_key exists
        const [user, existingResetKey] = await Promise.all([
          await User.findOne({ email }).lean(),
          await redis.get(`reset_key:${email}`),
        ]);

        // Throw error if user is not found
        if (!user) throw new AuthenticationError("email: User not found");

        // Create and send reset password link to email if existing reset-key
        // is not found
        if (!existingResetKey) {
          // Generate random reset key
          const resetKey = crypto.randomBytes(16).toString("hex");

          // Save reset_password key & reset_key in redis cache && send
          // reset link to user
          await Promise.all([
            redis.set(
              `reset_password:${resetKey}`,
              user._id,
              "ex",
              60 * 60 * 24
            ),
            redis.set(`reset_key:${email}`, resetKey, "ex", 60 * 60 * 2),
            resetPasswordMail({
              resetLink: `${process.env.ORIGIN}/reset-password/${resetKey}`,
              to: user.email,
              subject: "Reset your Sharinghood password",
            }),
          ]);

          return true;
        }

        // Re-send reset link if existing reset-key is found
        await resetPasswordMail({
          resetLink: `${process.env.ORIGIN}/reset-password/${existingResetKey}`,
          to: user.email,
          subject: "Reset your Sharinghood password",
        });

        return true;
      } catch (err) {
        handleErrors(err);
        throw err;
      }
    },
    resetPassword: async (
      _: unknown,
      { resetKey, password }: { resetKey: string; password: string },
      { redis }: { redis: Redis }
    ): Promise<boolean> => {
      try {
        // Get userId via resetKey from redis & hash user password
        const [userId, hashedPassword] = await Promise.all([
          redis.get(`reset_password:${resetKey}`),
          bcryptjs.hash(password, 12),
        ]);

        // Update user's password & migration status
        const user: UserDocument | null = await User.findById(userId);
        if (!user) throw new ApolloError("User not found");

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
    addFcmToken: async (
      _: unknown,
      { fcmToken }: { fcmToken: string },
      { user }: { user: UserTokenContext }
    ): Promise<boolean> => {
      if (!user) throw new AuthenticationError("Not Authenticated");

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

export default usersResolvers;
