import type { Redis } from "@upstash/redis";

export async function incrementNotificationCount(
  redis: Redis,
  recipientId: string,
  communityId: string
): Promise<void> {
  const notificationCount = (await redis.hget<number>(`notifications:${recipientId}`, communityId)) ?? 0;
  await redis.hset<number>(`notifications:${recipientId}`, { [communityId]: notificationCount + 1 });
}
