import { gql } from "apollo-server-micro";

export default gql`
  type Auth {
    accessToken: String!
    refreshToken: String!
  }

  ### User
  type User {
    id: ID!
    name: String!
    email: String
    imageUrl: String
    desc: String
    apartment: String
    isNotified: Boolean!
    isAdmin: Boolean!
    createdAt: String!
    lastLogin: String
    communities: [Community]
    notifications: [Notification]
    posts: [Post]
  }

  type PaginatedUsers {
    users: [User]
    hasMore: Boolean
    totalCount: Int
  }

  input UserInput {
    name: String
    email: String
    password: String
    image: String
    desc: String
    apartment: String
    communityId: ID
    isNotified: Boolean
    isCreator: Boolean
  }

  ### Community
  type Community {
    id: ID
    name: String
    code: String
    zipCode: String
    password: String
    creator: User
    members: [User]
    posts: [Post]
    requests: [Request]
    bookings: [Booking]
    notificationCount: Int
  }

  input CommunityInput {
    name: String!
    code: String!
    zipCode: String
    password: String
  }

  type Register {
    auth: Auth!
    community: Community
  }

  ### Post
  type Post {
    id: ID!
    title: String!
    desc: String!
    imageUrl: String!
    condition: String!
    isGiveaway: Boolean!
    creator: User
    community: Community
    paginatedThreads(
      offset: Int!
      limit: Int!
      communityId: ID!
    ): PaginatedThreads
    createdAt: String!
    bookings: [Booking]
  }

  type PaginatedPosts {
    posts: [Post]
    hasMore: Boolean
    totalCount: Int
  }

  input PostInput {
    postId: ID
    title: String
    desc: String
    image: String
    condition: String
    requesterId: ID
    isGiveaway: Boolean
  }

  ### Request
  type Request {
    id: ID!
    title: String!
    desc: String!
    imageUrl: String!
    timeFrame: String!
    dateNeed: String
    dateReturn: String
    creator: User!
    community: Community
    paginatedThreads(
      offset: Int!
      limit: Int!
      communityId: ID!
    ): PaginatedThreads
    createdAt: String!
  }

  type PaginatedRequests {
    requests: [Request]
    hasMore: Boolean
    totalCount: Int
  }

  input RequestInput {
    title: String!
    desc: String!
    image: String!
    timeFrame: String!
    dateNeed: String
    dateReturn: String
  }

  # Threads
  type Thread {
    id: ID!
    content: String!
    creator: User!
    community: Community!
  }

  type PaginatedThreads {
    threads: [Thread]
    hasMore: Boolean
    totalCount: Int
  }

  input ThreadInput {
    content: String!
    isPost: Boolean!
    parentId: ID!
    communityId: ID!
    recipientId: ID!
  }

  # Bookings
  type Booking {
    id: ID!
    post: Post
    status: String!
    booker: User
    timeFrame: String!
    dateNeed: String
    dateReturn: String
  }

  type PaginatedBookings {
    bookings: [Booking]
    hasMore: Boolean
    totalCount: Int
  }
  input BookingInput {
    postId: ID
    bookingId: ID
    communityId: ID
    notificationId: ID
    status: String
    timeFrame: String
    dateNeed: String
    dateReturn: String
  }

  # Notifications
  type Notification {
    id: ID!
    type: String!
    post: Post
    booking: Booking
    creator: User!
    recipient: User!
    notifier: User
    paginatedMessages(offset: Int, limit: Int): PaginatedMessages
    community: Community
  }

  type PaginatedNotifications {
    notifications: [Notification]
    hasMore: Boolean
  }

  input NotificationInput {
    type: String!
    recipientId: ID!
    communityId: ID!
    bookingInput: BookingInput
  }

  # Messages
  type Message {
    id: ID!
    content: String!
    creator: User!
    notification: Notification
    createdAt: String!
  }

  type PaginatedMessages {
    messages: [Message]
    hasMore: Boolean
  }

  input MessageInput {
    content: String!
    recipientId: ID!
    communityId: ID!
    notificationId: ID!
  }

  type TotalActivities {
    totalUsersCount: Int
    totalPostsCount: Int
    totalRequestsCount: Int
    totalBookingsCount: Int
    totalCommunitiesCount: Int
    communitiesActivities: [CommunityActivities]
  }

  type CommunityActivities {
    id: ID
    name: String
    code: String
    zipCode: String
    creator: User
    postsCount: Int
    membersCount: Int
    requestsCount: Int
    bookingsCount: Int
    paginatedPosts(offset: Int!, limit: Int!): PaginatedPosts
    paginatedMembers(offset: Int!, limit: Int!): PaginatedUsers
    paginatedRequests(offset: Int!, limit: Int!): PaginatedRequests
    paginatedBookings(offset: Int!, limit: Int!): PaginatedBookings
  }

  type Query {
    # User
    user: User
    validateResetLink(resetKey: String!): Boolean!
    unsubscribeUser(userId: String!, token: String!): Boolean!

    # Community
    community(communityId: ID!): Community
    findCommunity(communityCode: String!): Community
    communities: [Community]

    # Post
    post(postId: ID!): Post
    findPost(input: String!): [Post]!
    paginatedPosts(offset: Int!, limit: Int!, communityId: ID!): PaginatedPosts

    # Request
    request(requestId: ID!): Request
    paginatedRequests(
      offset: Int!
      limit: Int!
      communityId: ID!
    ): PaginatedRequests

    # Notification
    notification(notificationId: ID!): Notification
    findNotification(recipientId: ID!, communityId: ID!): Notification
    paginatedNotifications(
      offset: Int!
      limit: Int!
      communityId: ID!
    ): PaginatedNotifications

    # Activity
    totalActivities(offset: Int!, limit: Int!): TotalActivities
    communityActivities(communityId: ID!): CommunityActivities
  }

  type Mutation {
    # User
    login(email: String!, password: String!): Auth!
    logout: Boolean
    register(userInput: UserInput!, communityInput: CommunityInput): Register
    updateUser(userInput: UserInput!): User
    forgotPassword(email: String!): Boolean!
    resetPassword(resetKey: String!, password: String!): Boolean
    addFcmToken(fcmToken: String): Boolean!

    # Community
    joinCommunity(communityId: ID!): Community
    createCommunity(communityInput: CommunityInput): Community

    # Post
    createPost(postInput: PostInput!, communityId: ID): Post
    updatePost(postInput: PostInput!): Post
    inactivatePost(postId: ID): Boolean
    deletePost(postId: ID!): Boolean
    addPostToCommunity(postId: ID!, communityId: ID!): Community

    # Request
    createRequest(requestInput: RequestInput!, communityId: ID!): Request!
    deleteRequest(requestId: ID!): Boolean

    # Thread
    createThread(threadInput: ThreadInput!): Thread!

    # Message
    createMessage(messageInput: MessageInput!): Message

    # Booking
    updateBooking(bookingInput: BookingInput!): Booking
    createBooking(bookingInput: BookingInput!, communityId: ID!): Boolean

    # Notification
    createNotification(notificationInput: NotificationInput): Notification
  }

  type Subscription {
    # Message
    notificationMessage(notificationId: ID!): Message!
  }
`;
