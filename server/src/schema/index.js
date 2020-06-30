const { gql } = require('apollo-server');

const typeDefs = gql`
  ### User
  type User {
    _id: ID
    name: String
    email: String
    # password: String
    image: String
    apartment: String
    isNotified: Boolean
    isAdmin: Boolean
    createdAt: String
    communities: [Community]
    posts: [Post]
  }

  input UserInput {
    name: String
    email: String
    password: String
    image: String
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
    name: String
    code: String
    zipCode: String
    password: String
    creator: User
    members: [User]
    posts: [Post]
    requests: [Request]
  }

  input CommunityInput {
    name: String!
    code: String!
    zipCode: String
    password: String
  }

  type AuthAndOrCommunity {
    user: Auth!
    community: Community
  }

  ### Post
  type Post {
    _id: ID!
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
  }

  ### Request
  type Request {
    _id: ID!
    title: String
    desc: String
    image: String
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
    dateNeed: String!
    dateReturn: String!
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
    recipientId: ID!
    communityId: ID!
  }

  # Sent emails
  input EmailInput {
    email: String!
  }

  # Chat
  type Chat {
    _id: ID!
    participants: [User]
    contact: User
    messages: [Message]
    community: Community
    updatedAt: String
  }

  type Message {
    _id: ID!
    text: String
    sender: User
    createdAt: String
  }

  input MessageInput {
    chatId: ID!
    text: String!
  }

  # type Booking {
  #   _id: ID!
  #   post: Post
  #   booker: User
  #   dateType: Int
  #   dateNeed: String
  #   dateReturn: String
  #   pickupTime: String
  #   status: Int
  #   patcher: User
  #   community: Community
  # }

  type Booking {
    _id: ID!
    post: Post
    status: Int
    booker: User
    dateType: Int
    dateNeed: String
    dateReturn: String
  }

  # input BookingInput {
  #   dateNeed: String
  #   dateReturn: String
  #   pickupTime: String
  #   status: Int
  #   ownerId: ID
  #   postId: ID
  #   notifyContent: String
  #   notifyRecipientId: ID
  #   communityId: ID
  # }

  input BookingInput {
    postId: ID
    status: Int
    dateType: Int
    dateNeed: String
    dateReturn: String
  }

  # type Notification {
  #   _id: ID!
  #   onType: Int
  #   onDocId: ID
  #   content: String
  #   recipient: User
  #   creator: User
  #   isRead: Boolean
  # }

  type Notification {
    _id: ID!
    onType: Int
    booking: Booking
    participants: [User]
    messages: [Message]
  }

  input NotificationInput {
    bookingInput: BookingInput
    onType: Int
    recipientId: ID
  }

  # input NotificationInput {
  #   notificationId: ID!
  #   onType: Int
  #   content: String
  #   recipientId: ID
  #   creatorId: ID
  #   isRead: Boolean
  # }

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
    user(userId: ID): User!
    validateResetLink(userIdKey: String!): Boolean!

    # Community
    community(communityId: ID, communityCode: String): Community
    communities(userId: ID): [Community]

    # Post
    post(postId: ID!): Post
    posts(communityId: ID!): [Post]

    # Request
    request(requestId: ID!): Request
    requests(communityId: ID!): [Request]

    # Chat
    chat(chatId: ID!): Chat!
    chats(userId: ID): [Chat]

    # Message
    messages(chatId: ID!): [Message]

    # Booking
    bookings(userId: ID): [Booking]

    # Notification
    notification(notificationId: ID!): Notification
    notifications(userId: ID): [Notification]
    getNotifications(userId: ID): [Notification]

    # Activity
    totalActivities: TotalActivities
    communityActivities(communityId: ID!): CommunityActivities
  }

  ### Mutation
  type Mutation {
    # User
    login(email: String!, password: String!, communityId: ID): Auth!
    updateUser(userInput: UserInput): User
    joinCommunity(communityId: ID!): Community
    tokenRefresh(token: String!): Auth
    forgotPassword(email: String, accessKey: String): String
    resetPassword(userIdKey: String!, password: String!): Boolean

    # User & Community
    registerAndOrCreateCommunity(
      userInput: UserInput!
      communityInput: CommunityInput
    ): AuthAndOrCommunity!

    # Community
    createCommunity(communityInput: CommunityInput!): Community!

    # Post
    createPost(postInput: PostInput!, communityId: ID): Post!
    updatePost(postInput: PostInput!): Post!
    inactivatePost(postId: ID): Boolean
    deletePost(postId: ID!, communityId: ID): Post
    addPostToCommunity(postId: ID, communityId: ID): Community

    # Request
    createRequest(requestInput: RequestInput!, communityId: ID!): Request!
    deleteRequest(requestId: ID!): Request

    # Thread
    createThread(threadInput: ThreadInput!): Thread!

    # Chat
    createChat(recipientId: ID!): Chat

    # Message
    createMessage(messageInput: MessageInput!): Message

    # Booking
    createBooking(bookingInput: BookingInput!): Booking
    updateBooking(bookingId: ID!, bookingInput: BookingInput!): Booking

    # Notification
    createNotification(notificationInput: NotificationInput): Boolean
    updateNotification(notificationInput: NotificationInput!): Notification

    sentMail: Boolean
    getEmails(communityId: ID!): Boolean
  }

  type Subscription {
    newChatMessage(chatId: ID!): Message!
  }
`;

module.exports = typeDefs;
