import Redis from "ioredis";

// Create redis instance
const redis: Redis.Redis = new Redis(process.env.REDIS_URL);

export default redis;
