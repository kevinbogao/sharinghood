import {
  ApolloError,
  ForbiddenError,
  UserInputError,
  AuthenticationError,
  IGraphQLToolsResolveInfo,
} from "apollo-server-micro";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import communityResolvers from "./communities";
import { User, Community, Token } from "../entities";
import sendMail from "../../lib/mail";
import { upload } from "../../lib/image";
import { generateTokens } from "../../lib/auth";
import type {
  Auth,
  Context,
  UserInput,
  CreateUserInput,
  CreateCommunityInput,
} from "../../lib/types";

const userResolvers = {
  Query: {
    async user(
      _: unknown,
      __: never,
      { user, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<User> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const targetUser = await loader
        .loadEntity(User, "user")
        .where("user.id = :id", { id: user.userId })
        .info(info)
        .loadOne();

      if (!targetUser) throw new UserInputError("User not found");

      return targetUser;
    },
    async validateResetLink(
      _: unknown,
      { resetKey }: { resetKey: string },
      { connection, redis }: Context
    ): Promise<boolean> {
      const userId = await redis.get(`reset_password:${resetKey}`);
      const user = await connection
        .getRepository(User)
        .findOne({ where: { id: userId }, select: ["id"] });
      if (!userId || !user) return false;
      return true;
    },
    async unsubscribeUser(
      _: unknown,
      { userId, token }: { userId: string; token: string },
      { connection }: Context
    ): Promise<boolean> {
      const subscriber = await connection
        .getRepository(User)
        .findOne({ where: { id: userId } });
      if (!subscriber) throw new UserInputError("User not found");
      if (subscriber.unsubscribeToken !== token) return false;
      subscriber.isNotified = false;
      await connection.manager.save(subscriber);
      return true;
    },
  },
  Mutation: {
    async login(
      _: unknown,
      { email, password }: { email: string; password: string },
      { connection }: Context
    ): Promise<Auth> {
      const user = await connection.getRepository(User).findOne({
        where: { email },
      });
      if (!user) throw new UserInputError("User not found", { field: "email" });
      const isValidPassword = await bcryptjs.compare(password, user.password);
      if (!isValidPassword)
        throw new UserInputError("Invalid credentials", { field: "password" });
      user.lastLogin = new Date();
      await connection.manager.save(user);
      return generateTokens(user);
    },
    async logout(
      _: unknown,
      __: never,
      { user, connection }: Context
    ): Promise<boolean> {
      if (!user) return false;
      const currentUser = await connection.getRepository(User).findOne({
        where: { id: user.userId },
        select: ["id", "tokenVersion"],
      });
      if (!currentUser) return false;

      currentUser.tokenVersion++;
      await connection.manager.save(currentUser);

      return true;
    },
    async register(
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
          communityId,
        },
        communityInput,
      }: { userInput: CreateUserInput; communityInput: CreateCommunityInput },
      { connection, redis }: Context
    ): Promise<Promise<{ auth: Auth; community?: Community }>> {
      const existingUser = await connection
        .getRepository(User)
        .findOne({ where: { email }, select: ["id"] });
      if (existingUser)
        throw new UserInputError("Email exists", { field: "email" });

      const [hashedPass, imageUrl] = await Promise.all([
        bcryptjs.hash(password, 12),
        image && upload(image),
      ]);
      const unsubscribeToken = crypto.randomBytes(36).toString("hex");

      const user = new User();
      user.name = name;
      user.email = email;
      user.password = hashedPass;
      user.imageUrl = imageUrl;
      user.desc = desc;
      user.apartment = apartment;
      user.isNotified = isNotified;
      user.unsubscribeToken = unsubscribeToken;

      if (communityId) {
        const community = await connection
          .getRepository(Community)
          .findOne(communityId);
        if (!community) throw new ApolloError("Can't find community");
        user.communities = [community];
      }
      const newUser = await connection.manager.save(user);
      const { accessToken, refreshToken } = generateTokens(newUser);

      let community: Community | undefined;
      if (!communityId) {
        community = await communityResolvers.Mutation.createCommunity(
          { newUser },
          { communityInput },
          // @ts-ignore
          { connection, redis }
        );
      }

      return {
        auth: { accessToken, refreshToken },
        ...(!communityId && { community }),
      };
    },
    async updateUser(
      _: unknown,
      {
        userInput: { name, image, desc, apartment, isNotified },
      }: { userInput: UserInput },
      { user, connection }: Context
    ): Promise<User> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const userRepository = connection.getRepository(User);
      const targetUser = await userRepository.findOne(user.userId);
      if (!targetUser) throw new UserInputError("User not found");

      const imageUrl = image && (await upload(image));

      if (name) targetUser.name = name;
      if (imageUrl) targetUser.imageUrl = imageUrl;
      if (desc) targetUser.desc = desc;
      if (apartment) targetUser.apartment = apartment;
      if (isNotified !== undefined) targetUser.isNotified = isNotified;

      return await userRepository.save(targetUser);
    },
    async forgotPassword(
      _: unknown,
      { email }: { email: string },
      { connection, redis }: Context
    ): Promise<boolean> {
      const user = await connection
        .getRepository(User)
        .findOne({ where: { email } });
      if (!user) throw new UserInputError("email: User not found");

      const resetKey = crypto.randomBytes(16).toString("hex");
      await redis.set(`reset_password:${resetKey}`, user.id, "ex", 60 * 20);

      sendMail(
        "resetPassword",
        { resetLink: `${process.env.ORIGIN}/account/reset/${resetKey}` },
        { to: user.email, subject: "Reset your Sharinghood password" }
      );

      return true;
    },
    async resetPassword(
      _: unknown,
      { resetKey, password }: { resetKey: string; password: string },
      { connection, redis }: Context
    ): Promise<boolean> {
      const [userId, hashedPassword] = await Promise.all([
        redis.get(`reset_password:${resetKey}`),
        bcryptjs.hash(password, 12),
      ]);
      const user = await connection
        .getRepository(User)
        .findOne({ where: { id: userId } });
      if (!user) throw new ForbiddenError("User not found");

      user.password = hashedPassword;

      await Promise.all([
        connection.manager.save(user),
        redis.del(`reset_password:${resetKey}`),
      ]);

      return true;
    },
    async addFcmToken(
      _: unknown,
      { fcmToken }: { fcmToken: string },
      { user, connection }: Context
    ): Promise<boolean> {
      try {
        if (!user) throw new AuthenticationError("Not Authenticated");
        const token = new Token();
        token.firebase = fcmToken;
        token.ownerId = user.userId;
        await connection.manager.save(token);
        return true;
      } catch (err: any) {
        // Catch duplicate error
        if (err.code === "23505") return true;
        else return false;
      }
    },
  },
};

export default userResolvers;
