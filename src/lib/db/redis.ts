import { Redis } from "@upstash/redis";

import { CONFIG } from "../Config";

export const redis = new Redis({
  url: CONFIG.DATABASE.REDIS_REST_URL,
  token: CONFIG.DATABASE.REDIS_REST_TOKEN,
});
