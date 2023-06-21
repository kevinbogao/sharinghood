import type { z } from "zod";
import { object } from "zod";

import { Router } from "../../../lib/http/Router";
import { meSchema, meSelect, updateMeBodySchema } from "../../../lib/schema/users";
import { destroyImage, uploadImage } from "../../../lib/utils/cloudinary";

const router = new Router();

const response = object({ me: meSchema });
export type TMeResponse = z.infer<typeof response>;

router
  .schema({ summary: "Get Me", response })
  .auth()
  .get(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
    }) => {
      const me = await prisma.user.findFirstOrThrow({ where: { id: user_id }, select: meSelect });
      return { body: { me } };
    }
  );

router
  .schema({ summary: "Update Me", body: updateMeBodySchema, response })
  .auth()
  .put(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      body: { image, ...body },
    }) => {
      const imageUrl = image ? await uploadImage(image) : undefined;

      try {
        const me = await prisma.user.update({
          where: { id: user_id },
          data: {
            ...body,
            ...(imageUrl && { image_url: imageUrl }),
          },
        });
        return { body: { me } };
      } catch (err) {
        if (imageUrl) {
          await destroyImage(imageUrl);
        }
        throw err;
      }
    }
  );

export default router.handler();
