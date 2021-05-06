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
    postId: string;
    bookingId?: string;
    communityId?: string;
    notificationId?: string;
    status: number;
    dateType: number;
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

  export interface Message {
    __typename: string;
    _id: string;
    text: string;
    sender: User;
    notification: Notification;
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

  /// MUTATIONS LOGIN
  export interface LoginData {
    accessToken: string;
    refreshToken: string;
  }

  export interface LoginVars {
    email: string;
    password: string;
  }
}
