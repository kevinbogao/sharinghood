import { gql } from "apollo-server";
// @ts-ignore
import GraphQLJSON from "graphql-type-json";

const typeDefs = gql`
  ### JSON scalar
  scalar JSON

  ### User
  type User {
    _id: ID
    name: String
    email: String
    image: String
    desc: String
    apartment: String
    isNotified: Boolean
    isAdmin: Boolean
    createdAt: String
    lastLogin: String
    communities: [Community]
    notifications: [Notification]
    posts: [Post]
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

  type Auth {
    accessToken: String!
    refreshToken: String!
  }

  ### Community
  type Community {
    _id: ID!
    name: String!
    code: String!
    zipCode: String!
    password: String
    creator: User!
    members: [User]
    posts: [Post]
    requests: [Request]
    hasNotifications: Boolean
  }

  input CommunityInput {
    name: String!
    code: String!
    zipCode: String
    password: String
  }

  # Auth & Community
  type AuthAndOrCommunity {
    user: Auth!
    community: Community
  }

  ### Post
  type Post {
    _id: ID
    title: String
    desc: String
    image: String
    condition: Int
    isGiveaway: Boolean
    creator: User
    community: Community
    threads: [Thread]
    createdAt: String
  }

  input PostInput {
    postId: ID
    title: String
    desc: String
    image: String
    condition: Int
    isGiveaway: Boolean
    requesterId: ID
  }

  ### Request
  type Request {
    _id: ID!
    title: String
    desc: String
    image: String
    dateType: Int
    dateNeed: String
    dateReturn: String
    creator: User
    community: Community
    threads: [Thread]
    createdAt: String
  }

  input RequestInput {
    title: String!
    desc: String!
    image: String!
    dateType: Int!
    dateNeed: String
    dateReturn: String
  }

  # Threads
  type Thread {
    _id: ID
    content: String
    poster: User
    community: Community
  }

  input ThreadInput {
    content: String!
    isPost: Boolean!
    parentId: ID!
    communityId: ID!
    recipientId: ID
  }

  # Messages
  type Message {
    _id: ID!
    text: String
    sender: User
    createdAt: String
  }

  input MessageInput {
    text: String!
    recipientId: ID!
    communityId: ID!
    notificationId: ID!
  }

  # Bookings
  type Booking {
    _id: ID
    post: Post
    status: Int
    booker: User
    dateType: Int
    dateNeed: String
    dateReturn: String
  }

  input BookingInput {
    postId: ID
    bookingId: ID
    communityId: ID
    notificationId: ID
    status: Int
    dateType: Int
    dateNeed: String
    dateReturn: String
    notifyContent: String
    notifyRecipientId: ID
  }

  # Notifications
  type Notification {
    _id: ID!
    ofType: Int
    post: Post
    booking: Booking
    participants: [User]
    messages: [Message]
    isRead: JSON
    community: Community
  }

  input NotificationInput {
    ofType: Int
    recipientId: ID
    bookingInput: BookingInput
    communityId: ID
  }

  # Activities
  type TotalActivities {
    totalCommunities: Int
    totalUsers: Int
    totalPosts: Int
    totalRequests: Int
    totalBookings: Int
    communitiesActivities: [CommunityActivities]
  }

  type CommunityActivities {
    _id: ID
    name: String
    code: String
    zipCode: String
    numUsers: Int
    numPosts: Int
    numRequests: Int
    numBookings: Int
    creator: User
    members: [User]
    posts: [Post]
    requests: [Request]
    bookings: [Booking]
  }

  ### Query
  type Query {
    # User
    user(userId: ID, communityId: ID): User!
    validateResetLink(resetKey: String!): Boolean!

    # Community
    community(communityId: ID, communityCode: String): Community
    communities(userId: ID): [Community]

    # Post
    post(postId: ID!): Post
    posts(communityId: ID!): [Post]

    # Request
    request(requestId: ID!): Request
    requests(communityId: ID!): [Request]

    # Notification
    notification(notificationId: ID!): Notification
    notifications(communityId: ID!): [Notification]
    findNotification(recipientId: ID!, communityId: ID!): Notification

    # Activity
    totalActivities: TotalActivities
    communityActivities(communityId: ID!): CommunityActivities
  }

  ### Mutation
  type Mutation {
    # User
    login(email: String!, password: String!): Auth!
    logout: Boolean
    updateUser(userInput: UserInput): User
    tokenRefresh(token: String!): Auth
    forgotPassword(email: String!): Boolean!
    resetPassword(resetKey: String!, password: String!): Boolean
    addFcmToken(fcmToken: String): Boolean

    # User & Community
    registerAndOrCreateCommunity(
      userInput: UserInput!
      communityInput: CommunityInput
    ): AuthAndOrCommunity!

    # Community
    createCommunity(communityInput: CommunityInput!): Community
    joinCommunity(communityId: ID!): Community

    # Post
    createPost(postInput: PostInput!, communityId: ID): Post
    updatePost(postInput: PostInput!): Post
    inactivatePost(postId: ID): Boolean
    deletePost(postId: ID!, communityId: ID): Post
    addPostToCommunity(postId: ID, communityId: ID): Community

    # Request
    createRequest(requestInput: RequestInput!, communityId: ID!): Request!
    deleteRequest(requestId: ID!): Request

    # Thread
    createThread(threadInput: ThreadInput!): Thread!

    # Message
    createMessage(messageInput: MessageInput!): Message

    # Booking
    updateBooking(bookingInput: BookingInput!): Booking

    # Notification
    createNotification(notificationInput: NotificationInput): Notification
  }

  type Subscription {
    # Message
    newNotificationMessage(notificationId: ID!): Message!
  }
`;

export default typeDefs;
