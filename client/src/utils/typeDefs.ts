export namespace typeDefs {
  ///
  /// Type Definitions
  ///
  export interface Booking {
    __typename: string;
    _id: string;
    status: number;
    dateType: number;
    dateNeed: Date;
    dateReturn: Date;
    post: Post;
    booker: User;
    community: Community;
  }

  export interface BookingInput {
    postId?: string;
    bookingId?: string;
    communityId?: string;
    notificationId?: string;
    status: number;
    dateType?: number;
    dateNeed?: string;
    dateReturn?: string;
    notifyContent?: string;
    notifyRecipientId?: string;
  }

  export interface Community {
    __typename: string;
    _id: string;
    name: string;
    code: string;
    zipCode: string;
    password?: string;
    creator: User;
    members: Array<User>;
    posts: Array<Post>;
    requests: Array<Request>;
    hasNotifications?: boolean;
  }

  export interface CommunityInput {
    name: string;
    code: string;
    zipCode?: string;
    password?: string;
  }

  export interface Message {
    __typename: string;
    _id: string;
    text: string;
    sender: User;
    notification: Notification;
  }

  export interface MessageInput {
    text: string;
    recipientId: string;
    communityId: string;
    notificationId: string;
  }

  export interface Notification {
    __typename: string;
    _id: string;
    ofType: number;
    post?: Post;
    booking?: Booking;
    community: Community;
    messages: Array<Message>;
    participants: Array<User>;
    isRead: {
      [userId: string]: boolean;
    };
  }

  export interface NotificationInput {
    ofType: number;
    recipientId: string;
    communityId: string;
    bookingInput?: BookingInput;
  }

  export interface Post {
    __typename: string;
    _id: string;
    title: string;
    desc: string;
    condition: number;
    image: string;
    isGiveaway: boolean;
    creator: User;
    threads: Array<Thread>;
    bookings: Array<Booking>;
  }

  export interface PostInput {
    postId?: string;
    title?: string;
    desc?: string;
    image?: string;
    condition?: number;
    isGiveaway?: boolean;
    requesterId?: string;
  }

  export interface Request {
    __typename: string;
    _id: string;
    title: string;
    desc: string;
    image: string;
    dateType: number;
    dateNeed: Date;
    dateReturn: Date;
    creator: User;
    threads: Array<Thread>;
  }

  export interface RequestInput {
    title: string;
    desc: string;
    image: string;
    dateType: number;
    dateNeed?: string;
    dateReturn?: string;
  }

  export interface Thread {
    __typename: string;
    _id: string;
    content: string;
    poster: User;
    community: Community;
  }

  export interface ThreadInput {
    content: string;
    isPost: boolean;
    parentId: string;
    communityId: string;
    recipientId: string;
  }

  export interface User {
    __typename: string;
    _id: string;
    name: string;
    email: string;
    password: string;
    image: string;
    desc?: string;
    apartment?: string;
    lastLogin?: Date;
    isNotified: boolean;
    isAdmin: boolean;
    isMigrated: boolean;
    tokenVersion: number;
    fcmTokens: Array<string>;
    posts: Array<Post>;
    requests: Array<Request>;
    communities: Array<Community>;
    notifications: Array<Notification>;
    createdAt: Date;
  }

  export interface UserInput {
    name?: string;
    email?: string;
    password?: string;
    image?: string;
    desc?: string;
    apartment?: string;
    communityId?: string;
    isNotified?: boolean;
    isCreator?: boolean;
  }

  export interface CommunityActivities {
    _id: string;
    name: string;
    code: string;
    zipCode: string;
    numUsers?: number;
    numPosts?: number;
    numRequests?: number;
    numBookings?: number;
    creator: User;
    members: [User];
    posts: [Post];
    requests: [Request];
    bookings: [Booking];
  }

  export interface TotalActivities {
    totalCommunities: number;
    totalUsers: number;
    totalPosts: number;
    totalRequests: number;
    totalBookings: number;
    communitiesActivities: [CommunityActivities];
  }

  ///
  /* LOCAL */
  ///

  /// LOCAL_COMMUNITY
  export interface LocalCommunityData {
    community: Community;
  }

  export interface LocalCommunityVars {
    communityId: string;
  }

  /// GET_USER
  export interface UserData {
    user: User;
  }

  /// VALIDATE_RESET_LINK
  export interface ValidateResetLinkData {
    validateResetLink: boolean;
  }

  export interface ValidateResetLinkVars {
    resetKey: string;
  }

  /// UNSUBSCRIBE_USER
  export interface UnsubscribeUserData {
    unsubscribeUser: boolean;
  }

  export interface UnsubscribeUserVars {
    userId: string;
    token: string;
  }

  ///
  /* USER */
  ///

  /// LOGIN
  export interface LoginData {
    login: {
      accessToken: string;
      refreshToken: string;
    };
  }

  export interface LoginVars {
    email: string;
    password: string;
  }

  /// LOGOUT
  export interface LogoutData {
    logout: boolean;
  }

  /// UPDATE_USER
  export interface UpdateUserData {
    updateUser: User;
  }

  export interface UpdateUserVars {
    userInput: UserInput;
  }

  /// FORGOT_PASSWORD
  export interface ForgotPasswordData {
    forgotPassword: boolean;
  }

  export interface ForgotPasswordVars {
    email: string;
  }

  /// RESET_PASSWORD
  export interface ResetPasswordData {
    resetPassword: boolean;
  }

  export interface ResetPasswordVars {
    resetKey: string;
    password: string;
  }

  /// ADD_FCM_TOKEN_TO_USER
  export interface AddFcmTokenData {
    addFcmToken: boolean;
  }

  export interface AddFcmTokenVars {
    fcmToken: string;
  }

  ///
  /* USER & COMMUNITY */
  ///

  /// REGISTER_AND_OR_CREATE_COMMUNITY
  export interface RegisterAndOrCreateCommunityData {
    registerAndOrCreateCommunity: {
      user: {
        accessToken: string;
        refreshToken: string;
      };
      community: Community;
    };
  }

  export interface RegisterAndOrCreateCommunityVars {
    userInput: UserInput;
    communityInput?: CommunityInput;
  }

  ///
  /* COMMUNITY */
  ///

  /// FIND_COMMUNITY
  export interface FindCommunityData {
    community: Community;
  }

  export interface FindCommunityVars {
    communityCode: string;
  }

  /// FIND_COMMUNITY_AND_MEMBERS
  export interface FindCommunityAndMembersData {
    community: Community;
  }

  export interface FindCommunityAndMembersVars {
    communityCode: string;
  }

  /// GET_USER_COMMUNITIES
  export interface UserCommunitiesData {
    communities: Array<Community>;
  }

  /// GET_CURRENT_COMMUNITY_AND_COMMUNITIES
  export interface CurrentCommunityAndCommunitiesData {
    community: Community;
    communities: Array<Community>;
  }

  export interface CurrentCommunityAndCommunitiesVars {
    communityId: string;
  }

  /// CREATE_COMMUNITY
  export interface CreateCommunityData {
    createCommunity: Community;
  }

  export interface CreateCommunityVars {
    communityInput: CommunityInput;
  }

  /// JOIN_COMMUNITY
  export interface JoinCommunityData {
    joinCommunity: Community;
  }

  export interface JoinCommunityVars {
    communityId: string;
  }

  ///
  /* POST */
  ///

  /// GET_POST_DETAILS
  export interface PostDetailsData {
    post: Post;
    community: Community;
  }

  export interface PostDetailsVars {
    postId: string;
    communityId: string;
  }

  /// GET_POSTS
  export interface PostsData {
    posts: Array<Post>;
  }

  export interface PostsVars {
    communityId: string;
  }

  /// GET_POST_AND_COMMUNITIES
  export interface PostAndCommunitiesData {
    post: Post;
    communities: Array<Community>;
  }

  export interface PostAndCommunitiesVars {
    postId: string;
  }

  /// CREATE_POST
  export interface CreatePostData {
    createPost: Post;
  }

  export interface CreatePostVars {
    postInput: PostInput;
    communityId: string;
  }

  /// UPDATE_POST
  export interface UpdatePostData {
    updatePost: Post;
  }

  export interface UpdatePostVars {
    postInput: PostInput;
  }

  /// DELETE_POST
  export interface DeletePostData {
    deletePost: Post;
  }

  export interface DeletePostVars {
    postId: string;
  }

  /// ADD_POST_TO_COMMUNITY
  export interface AddPostToCommunityData {
    addPostToCommunity: Community;
  }

  export interface AddPostToCommunityVars {
    postId: string;
    communityId: string;
  }

  /// INACTIVATE_POST
  export interface InactivatePostData {
    inactivatePost: boolean;
  }

  export interface InactivatePostVars {
    postId: string;
  }

  ///
  /* REQUEST */
  ///

  /// GET_REQUESTS
  export interface RequestsData {
    requests: Array<Request>;
  }

  export interface RequestsVars {
    communityId: string;
  }

  /// GET_REQUEST_DETAILS
  export interface RequestDetailsData {
    request: Request;
    community: Community;
  }

  export interface RequestDetailsVars {
    requestId: string;
    communityId: string;
  }

  /// CREATE_REQUEST
  export interface CreateRequestData {
    createRequest: Request;
  }

  export interface CreateRequestVars {
    requestInput: RequestInput;
    communityId: string;
  }

  /// DELETE_REQUEST
  export interface DeleteRequestData {
    deleteRequest: Request;
  }

  export interface DeleteRequestVars {
    requestId: string;
  }

  ///
  /* NOTIFICATION */
  ///

  /// GET_NOTIFICATION
  export interface NotificationData {
    notification: Notification;
    community: Community;
  }

  export interface NotificationVars {
    notificationId: string;
    communityId: string;
  }

  /// GET_NOTIFICATIONS
  export interface NotificationsData {
    notifications: Array<Notification>;
  }

  export interface NotificationsVars {
    communityId: string;
  }

  /// FIND_NOTIFICATION
  export interface FindNotificationData {
    findNotification: typeDefs.Notification;
  }

  export interface FindNotificationVars {
    recipientId: string;
    communityId: string;
  }

  /// CREATE_NOTIFICATION
  export interface CreateNotificationData {
    createNotification: Notification;
  }

  export interface CreateNotificationVars {
    notificationInput: NotificationInput;
  }

  ///
  /* BOOKING */
  ///

  /// UPDATE_BOOKING
  export interface UpdateBookingData {
    _id: string;
    status: number;
  }

  export interface UpdateBookingVars {
    bookingInput: BookingInput;
  }

  ///
  /* THREAD */
  ///

  /// CREATE_THREAD
  export interface CreateThreadData {
    createThread: Thread;
  }

  export interface CreateThreadVars {
    threadInput: ThreadInput;
  }

  ///
  /* MESSAGE */
  ///

  /// CREATE_MESSAGE
  export interface CreateMessageData {
    createMessage: Message;
  }

  export interface CreateMessageVars {
    messageInput: MessageInput;
  }

  ///
  /* ACTIVITY */
  ///

  /// GET_TOTAl_ACTIVITIES
  export interface TotalActivitiesData {
    totalActivities: TotalActivities;
  }

  /// GET_COMMUNITY_ACTIVITIES
  export interface CommunityActivitiesData {
    communityActivities: CommunityActivities;
  }

  export interface CommunityActivitiesVars {
    communityId: string;
  }
}
