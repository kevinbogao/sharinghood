import {
  ForbiddenError,
  UserInputError,
  AuthenticationError,
  IGraphQLToolsResolveInfo,
} from "apollo-server-micro";
import moment from "moment";
import { User, Request, Community } from "../entities";
import sendMail from "../../lib/mail";
import pushNotification from "../../lib/firebase";
import { upload, destroy } from "../../lib/image";
import { TimeFrame } from "../../lib/enums";
import type { Context, CreateRequestInput } from "../../lib/types";

const requestResolvers = {
  Query: {
    async request(
      _: never,
      { requestId }: { requestId: string },
      { user, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<Request> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const request = await loader
        .loadEntity(Request, "request")
        .where("request.id = :id", { id: requestId })
        .info(info)
        .loadOne();

      if (!request) throw new UserInputError("Request not found");
      return request;
    },
    async requests(
      _: never,
      {
        offset,
        limit,
        communityId,
      }: { offset: number; limit: number; communityId: string },
      { user, loader }: Context,
      info: IGraphQLToolsResolveInfo
    ): Promise<Request[]> {
      if (!user) throw new AuthenticationError("Not Authenticated");

      const [requests] = await loader
        .loadEntity(Request, "request")
        .where("request.communityId = :communityId", { communityId })
        .info(info)
        .order({ "request.createdAt": "DESC" })
        .paginate({ offset, limit })
        .loadPaginated();

      return requests;
    },
  },
  Mutation: {
    async createRequest(
      _: never,
      {
        requestInput: { title, desc, image, timeFrame, dateNeed, dateReturn },
        communityId,
      }: { requestInput: CreateRequestInput; communityId: string },
      { user, connection }: Context
    ): Promise<Request> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const [creator, community] = await Promise.all([
        connection.getRepository(User).findOne({ where: { id: user?.userId } }),
        connection.getRepository(Community).findOne({
          where: { id: communityId },
          relations: ["members", "members.tokens"],
        }),
      ]);

      if (!creator) throw new UserInputError("User not found");
      if (!community) throw new UserInputError("Community not found");

      const imageUrl = await upload(image);

      const request = new Request();
      request.title = title;
      request.desc = desc;
      request.imageUrl = imageUrl;
      request.timeFrame = timeFrame;
      request.creator = creator;
      request.community = community;
      if (timeFrame === TimeFrame.SPECIFIC) {
        request.dateNeed = dateNeed;
        request.dateReturn = dateReturn;
      }

      const newRequest = await connection.manager.save(request);

      community.members
        .filter((member) => member.isNotified && member.id !== creator.id)
        .forEach((recipient) => {
          sendMail(
            "createRequest",
            {
              userName: creator.name,
              itemName: request.title,
              itemUrl: `${process.env.ORIGIN}/requests/${newRequest.id}`,
              itemImageUrl: request.imageUrl,
              ...(request?.dateNeed && {
                dateNeed: moment(+request.dateNeed!).format("MMM DD"),
              }),
              recipientId: recipient.id,
              unsubscribeToken: recipient.unsubscribeToken,
            },
            {
              to: recipient.email,
              subject: `${creator.name} requested ${title} in your community.`,
            }
          );
        });

      const receivers = community.members.filter(
        (member) => member.id !== creator.id
      );

      pushNotification(
        {},
        `${user.userName} requested ${title} in the ${community.name} community`,
        receivers
      );

      return newRequest;
    },
    async deleteRequest(
      _: never,
      { requestId }: { requestId: string },
      { user, connection }: Context
    ): Promise<boolean> {
      if (!user) throw new AuthenticationError("Not Authenticated");
      const requestRepository = connection.getRepository(Request);
      const request = await requestRepository.findOne({
        where: { id: requestId },
      });
      if (!request) throw new UserInputError("Request not found");
      if (request.creatorId !== user.userId)
        throw new ForbiddenError("Unauthorized user");

      await Promise.all([
        destroy(request.imageUrl),
        connection.getRepository(Request).remove(request),
      ]);
      return true;
    },
  },
};

export default requestResolvers;
