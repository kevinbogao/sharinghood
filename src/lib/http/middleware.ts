import type { Post } from "@prisma/client";

import { CONFIG } from "../Config";
import type { TBaseQuerySchema, TCommunityIdSchema } from "../schema";
import { HttpStatusCodeEnum, ResponseErrorCodeEnum } from "./enums";
import { ForbiddenError, ResponseError } from "./errors";
import type { IAuthContext, TMiddleware } from "./types";

function isAuthContext(ctx: any): ctx is IAuthContext {
  return "user" in ctx && Boolean(ctx.user);
}

export const admin: TMiddleware<void> = ({ ctx }) => {
  if (!isAuthContext(ctx)) {
    throw new Error("Admin middleware is expected to be used with auth method");
  }

  if (!CONFIG.API.AUTH.ADMIN_IDS.includes(ctx.user.user_id)) {
    throw new ResponseError({
      status: HttpStatusCodeEnum.UNAUTHORIZED,
      code: ResponseErrorCodeEnum.ROUTE_ACCESS_FORBIDDEN,
      message: "User may not access this route",
    });
  }
};

export const member: TMiddleware<void> = async ({ ctx, query, body }) => {
  if (!isAuthContext(ctx)) {
    throw new Error("Member middleware is expected to be used with auth method");
  }

  const community_id = (query as TCommunityIdSchema).community_id || (body as TCommunityIdSchema).community_id;
  if (!community_id) {
    throw new Error("community_id is expected to part of the query schema or body schema");
  }

  if (ctx.user.is_admin) {
    return;
  }

  const userOnCommunity = await ctx.prisma.usersOnCommunities.findUnique({
    where: {
      community_id_user_id: { community_id, user_id: ctx.user.user_id },
    },
  });

  if (!userOnCommunity) {
    throw new ForbiddenError("User is not a member", {
      code: ResponseErrorCodeEnum.NOT_A_MEMBER,
    });
  }
};

interface IPostOwnerContext {
  post: Post;
}

export const postOwner: TMiddleware<IPostOwnerContext> = async ({ ctx, query }) => {
  if (!isAuthContext(ctx)) {
    throw new Error("Post owner middleware is expected to be used with auth method");
  }

  const { id } = query as TBaseQuerySchema;
  if (!id) {
    throw new Error("id is expected to part of the query schema");
  }

  const post = await ctx.prisma.post.findFirstOrThrow({ where: { id } });
  if (post.creator_id !== ctx.user.user_id) {
    throw new ForbiddenError("Resource does not belong to user", {
      code: ResponseErrorCodeEnum.FORBIDDEN_ITEM,
    });
  }

  return { post };
};
