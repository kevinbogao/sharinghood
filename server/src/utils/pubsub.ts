import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

const options = {
  retryStrategy: (times: number) => Math.min(times * 100, 3000),
};

const pubsub: RedisPubSub = new RedisPubSub({
  publisher: new Redis(process.env.REDIS_URL, options),
  subscriber: new Redis(process.env.REDIS_URL, options),
});

export default pubsub;
