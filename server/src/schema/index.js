const { gql } = require('apollo-server');

const typeDefs = gql`
  ### User
  type User {
    _id: ID
    name: String
    email: String
    password: String
    image: String
    apartment: String
    isNotified: Boolean
    isAdmin: Boolean
    createdAt: String
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    image: String!
    apartment: String!
    communityId: ID!
    isNotified: Boolean!
    isCreator: Boolean!
  }

  type Auth {
    token: String!
    tokenExpiration: Int!
    userId: ID!
    userName: String!
    communityId: ID!
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
  }

  input PostInput {
    title: String!
    desc: String!
    image: String!
    condition: Int!
    isGiveaway: Boolean!
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
  }

  input ThreadInput {
    content: String!
    isPost: Boolean!
    parentId: ID!
    recipientId: ID!
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

  type Booking {
    _id: ID!
    post: Post
    booker: User
    dateNeed: String
    dateReturn: String
    pickupTime: String
    status: Int
    patcher: User
  }

  input BookingInput {
    dateNeed: String
    dateReturn: String
    pickupTime: String
    status: Int
    ownerId: ID
    postId: ID
    notifyContent: String
    notifyRecipientId: ID
  }

  # union Result = Post | Request | Booking | Chat

  type Notification {
    _id: ID!
    onType: Int
    onDocId: ID
    content: String
    recipient: User
    creator: User
    isRead: Boolean
  }

  input NotificationInput {
    notificationId: ID!
    onType: Int
    content: String
    recipientId: ID
    creatorId: ID
    isRead: Boolean
  }

  ### Query
  type Query {
    # Community
    community(communityId: ID): Community

    # Post
    post(postId: ID!): Post!
    posts(communityId: ID): [Post]
    getPosts(communityId: ID!): [Post]

    # Request
    request(requestId: ID!): Request!
    requests(communityId: ID): [Request]

    # Chat
    chat(chatId: ID!): Chat!
    chats(userId: ID): [Chat]

    # Message
    messages(chatId: ID!): [Message]

    # Booking
    bookings(userId: ID): [Booking]

    # Notification
    notifications(userId: ID): [Notification]
  }

  ### Mutation
  type Mutation {
    # User
    login(email: String!, password: String!): Auth!
    register(userInput: UserInput!): Auth!

    # Community
    community(communityCode: String!): Community
    createCommunity(communityInput: CommunityInput!): Community!

    # Post
    createPost(postInput: PostInput!): Post!
    updatedPost(postInput: PostInput!): Post!
    deletePost(postId: ID!): Post

    # Request
    createRequest(requestInput: RequestInput!): Request!
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
    updateNotification(notificationInput: NotificationInput!): Notification
  }

  type Subscription {
    newChatMessage(chatId: ID!): Message!
  }
`;

module.exports = typeDefs;
