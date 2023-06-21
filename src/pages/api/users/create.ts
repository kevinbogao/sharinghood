import { hash } from "bcrypt";

import { CONFIG } from "../../../lib/Config";
import { Router } from "../../../lib/http/Router";
import { createUserQuerySchema, createUserWithCommunityBodySchema } from "../../../lib/schema/users";
import { generateUnsubscribeToken } from "../../../lib/utils/string";

const router = new Router();

router
  .schema({
    query: createUserQuerySchema,
    body: createUserWithCommunityBodySchema,
    summary: "Create User (and Community)",
  })
  .post(async ({ ctx: { prisma }, query: { community_id }, body: { name, email, password, community_input } }) => {
    if (!community_id && !community_input) {
      throw new Error("FIXME");
    }

    const passwordHash = await hash(password, CONFIG.API.AUTH.PASSWORD_HASH_SALT);

    await prisma.$transaction(async (p) => {
      const _user = await p.user.create({
        data: { name, email, password: passwordHash, unsubscribe_token: generateUnsubscribeToken() },
      });

      if (community_id) {
        await p.usersOnCommunities.create({ data: { user_id: _user.id, community_id } });
        return;
      }

      if (community_input) {
        await p.community.create({
          data: {
            ...community_input,
            creator_id: _user.id,
            users: { create: [{ user: { connect: { id: _user.id } } }] },
          },
        });
      }
    });

    return {};
  });

export default router.handler();
