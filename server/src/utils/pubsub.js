const { RedisPubSub } = require("graphql-redis-subscriptions");
const Redis = require("ioredis");

const options = {
  retryStrategy: (times) => Math.min(times * 100, 3000),
};

const pubsub = new RedisPubSub({
  publisher: new Redis(process.env.REDIS_URL, options),
  subscriber: new Redis(process.env.REDIS_URL, options),
});

module.exports = pubsub;
