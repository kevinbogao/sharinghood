import { TimeFrameEnum } from "@prisma/client";
import type { z } from "zod";
import { object } from "zod";

import { HttpStatusCodeEnum, ResponseErrorCodeEnum } from "../../../lib/http/enums";
import { ResponseError } from "../../../lib/http/errors";
import { member } from "../../../lib/http/middleware";
import { Router } from "../../../lib/http/Router";
import { basePaginationResultSchema } from "../../../lib/schema";
import {
  createRequestBodySchema,
  getRequestsQuerySchema,
  requestSchema,
  requestSelect,
} from "../../../lib/schema/requests";
import { destroyImage, uploadImage } from "../../../lib/utils/cloudinary";

const router = new Router();

const getResponse = object({ requests: requestSchema.array() }).merge(basePaginationResultSchema);
export type TGetRequestsResponse = z.infer<typeof getResponse>;

router
  .schema({ query: getRequestsQuerySchema, response: getResponse, summary: "Get Requests From Community" })
  .auth()
  .use(member)
  .get(async ({ ctx: { prisma }, query: { community_id, skip, take } }) => {
    const [requests, count] = await Promise.all([
      prisma.request.findMany({
        where: { community_id },
        select: requestSelect,
        orderBy: { created_at: "desc" },
      }),
      prisma.request.count({ where: { community_id } }),
    ]);

    return { body: { requests, has_more: skip + take < count, total_count: count } };
  });

const createResponse = object({ request: requestSchema });
export type TCreateRequestResponse = z.infer<typeof createResponse>;

router
  .schema({ body: createRequestBodySchema, response: createResponse, summary: "Create Request" })
  .auth()
  .use(member)
  .post(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      body: { time_frame, date_need, date_return, image, ...body },
    }) => {
      const imageUrl = await uploadImage(image);

      try {
        if (time_frame !== TimeFrameEnum.SPECIFIC) {
          const request = await prisma.request.create({
            data: { ...body, time_frame, creator_id: user_id, image_url: imageUrl },
          });

          return { body: { request } };
        }

        if (!date_need) {
          throw new ResponseError({
            status: HttpStatusCodeEnum.BAD_REQUEST,
            code: ResponseErrorCodeEnum.NOT_FOUND_DATE_NEED,
            message: "date_need is required for booking on specific data",
          });
        }

        const request = await prisma.request.create({
          data: {
            ...body,
            time_frame,
            creator_id: user_id,
            image_url: imageUrl,
            date_need,
            date_return: date_return ?? date_need,
          },
          select: requestSelect,
        });

        return { body: { request } };
      } catch (err) {
        await destroyImage(imageUrl);
        throw err;
      }
    }
  );

export default router.handler();
