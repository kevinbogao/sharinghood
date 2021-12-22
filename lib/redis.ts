import Redis from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";

export const redis = new Redis(process.env.REDIS_URL!);

const options = {
  retryStrategy: (times: number) => Math.min(times * 100, 3000),
};

export const pubsub: RedisPubSub = new RedisPubSub({
  publisher: new Redis(process.env.REDIS_URL, options),
  subscriber: new Redis(process.env.REDIS_URL, options),
});
