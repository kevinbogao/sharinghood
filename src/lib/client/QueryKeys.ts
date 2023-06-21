export const QueryKeys = {
  Auth: {
    session: ["/auth/session"],
    resetPasswordCode: (code: string) => [`/auth/password/reset?code=${code}`],
  },
  Admin: {
    stats: ["/admin/stats"],
    communities: ["/admin/stats/communities"],
    communityStats: (communityId: string) => [`/admin/stats/${communityId}`],
    communityUsers: (communityId: string) => [`/admin/stats/${communityId}/users`],
    communityPosts: (communityId: string) => [`/admin/stats/${communityId}/posts`],
    communityRequests: (communityId: string) => [`/admin/stats/${communityId}/requests`],
    communityBookings: (communityId: string) => [`/admin/stats/${communityId}/bookings`],
  },
  Decks: {
    decks: ["/decks"],
  },
  Users: {
    me: ["/users/me"],
    users: (communityId: string) => [`/users?community_id=${communityId}`],
    unsubscribe: (id: string, token: string) => [`/users/unsubscribe?id=${id}&token=${token}`],
  },
  Communities: {
    communities: ["/communities"],
    searchCommunity: (code: string) => [`/communities/search?code=${code}`],
  },
  Threads: {
    threads: (communityId: string, postId?: string, requestId?: string) => [
      `/threads?community_id=${communityId}`,
      postId,
      requestId,
    ],
  },
  Posts: {
    posts: (communityId: string) => [`/posts?community_id=${communityId}`],
    post: (id: string) => [`/post/${id}`],
    postCommunities: (id: string) => [`/post/${id}/communities`],
  },
  Requests: {
    requests: ["/requests"],
    request: (id: string) => [`/requests/${id}`],
  },
  Notifications: {
    notification: (id: string) => [`/notifications/${id}`],
    notifications: (communityId: string) => [`/notifications?community_id=${communityId}`],
  },
  Messages: {
    messages: (notificationId: string) => [`/messages/${notificationId}`],
  },
} as const;
