import { Router } from "../../../../lib/http/Router";
import { baseQuerySchema } from "../../../../lib/schema";

const router = new Router();

router
  .schema({ query: baseQuerySchema, summary: "Join Community" })
  .auth()
  .post(
    async ({
      ctx: {
        prisma,
        user: { user_id },
      },
      query: { id },
    }) => {
      await prisma.usersOnCommunities.create({ data: { user_id, community_id: id } });

      return {};
    }
  );

export default router.handler();
