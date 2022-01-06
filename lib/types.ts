import { Connection } from "typeorm";
import { Redis } from "ioredis";
import { GraphQLDatabaseLoader } from "@mando75/typeorm-graphql-loader";
import {
  TimeFrame,
  ItemCondition,
  BookingStatus,
  NotificationType,
} from "./enums";

export interface RefreshToken {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

export interface AccessToken extends Omit<RefreshToken, "tokenVersion"> {
  userName: string;
  email: string;
  isAdmin?: boolean;
}

export interface Auth {
  accessToken: string;
  refreshToken: string;
}

export interface Context {
  user?: AccessToken;
  redis: Redis;
  loader: GraphQLDatabaseLoader;
  connection: Connection;
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
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  image?: string;
  desc?: string;
  apartment: string;
  isNotified: boolean;
  communityId?: string;
}

export interface CreateCommunityInput {
  name: string;
  code: string;
  zipCode?: string;
  password?: string;
}

export interface PostInput {
  postId: string;
  title?: string;
  desc?: string;
  image?: string;
  condition?: ItemCondition;
  isGiveaway?: boolean;
  requesterId?: string;
}

export interface CreatePostInput {
  title: string;
  desc: string;
  image: string;
  condition: ItemCondition;
  isGiveaway: boolean;
  requesterId?: string;
}

export interface CreateRequestInput {
  title: string;
  desc: string;
  image: string;
  timeFrame: TimeFrame;
  dateNeed?: Date;
  dateReturn?: Date;
}

export interface CreateThreadInput {
  content: string;
  isPost: boolean;
  parentId: string;
  communityId: string;
  recipientId: string;
}

export interface BookingInput {
  status: BookingStatus;
  bookingId: string;
  communityId: string;
  notificationId: string;
}

export interface CreateBookingInput {
  postId: string;
  communityId: string;
  status: BookingStatus;
  timeFrame: TimeFrame;
  dateNeed?: Date;
  dateReturn?: Date;
}

export interface CreateNotificationInput {
  type: NotificationType;
  postId?: string;
  recipientId: string;
  communityId: string;
  bookingInput?: CreateBookingInput;
}

export interface CreateMessageInput {
  content: string;
  recipientId: string;
  communityId: string;
  notificationId: string;
}

///
/// Type Definitions
///
export interface Booking {
  __typename: string;
  id: string;
  status: BookingStatus;
  timeFrame: TimeFrame;
  dateNeed: Date;
  dateReturn: Date;
  post: Post;
  booker: User;
  community: Community;
}

export interface Community {
  __typename: string;
  id: string;
  name: string;
  code: string;
  zipCode: string;
  password?: string;
  creator: User;
  members: User[];
  posts: Post[];
  requests: Request[];
  bookings: Booking[];
  notificationCount: number;
}

export interface Message {
  __typename: string;
  id: string;
  content: string;
  creator: User;
  notification: Notification;
}

export interface Notification {
  __typename: string;
  id: string;
  type: NotificationType;
  post?: Post;
  booking?: Booking;
  community: Community;
  messages: Message[];
  creator: User;
  recipient: User;
  notifier: User;
}

export interface Post {
  __typename: string;
  id: string;
  title: string;
  desc: string;
  condition: ItemCondition;
  imageUrl: string;
  isGiveaway: boolean;
  creator: User;
  threads: Thread[];
  bookings: Booking[];
}

export interface Request {
  __typename: string;
  id: string;
  title: string;
  desc: string;
  imageUrl: string;
  timeFrame: TimeFrame;
  dateNeed: Date;
  dateReturn: Date;
  creator: User;
  threads: Thread[];
}

export interface Thread {
  __typename: string;
  id: string;
  content: string;
  creator: User;
  community: Community;
}

export interface User {
  __typename: string;
  id: string;
  name: string;
  email: string;
  password: string;
  imageUrl?: string;
  desc?: string;
  apartment: string;
  lastLogin?: Date;
  isNotified: boolean;
  isAdmin: boolean;
  isMigrated: boolean;
  tokenVersion: number;
  fcmTokens: string[];
  posts: Post[];
  requests: Request[];
  communities: Community[];
  notifications: Notification[];
  createdAt: Date;
}

export interface CommunityActivities {
  id: string;
  name: string;
  code: string;
  zipCode: string;
  // usersCount?: number;
  // postsCount?: number;
  // requestsCount?: number;
  // bookingsCount?: number;
  creator: User;
  members: User[];
  posts: Post[];
  requests: Request[];
  bookings: Booking[];
}

export interface CommunitiesActivities {
  id: string;
  name: string;
  code: string;
  membersCount: number;
  postsCount: number;
  requestsCount: number;
  bookingsCount: number;
}

export interface TotalActivities {
  totalUsersCount: number;
  totalPostsCount: number;
  totalRequestsCount: number;
  totalBookingsCount: number;
  totalCommunitiesCount: number;
  communitiesActivities: CommunitiesActivities[];
}

///
/* LOCAL */
///

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
  login: Auth;
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

//   /// REGISTER_AND_OR_CREATE_COMMUNITY
export interface RegisterData {
  register: {
    auth: Auth;
    community: Community;
  };
}

export interface RegisterVars {
  userInput: CreateUserInput;
  communityInput?: CreateCommunityInput;
}

///
/* COMMUNITY */
///

/// FIND_COMMUNITY
export interface FindCommunityData {
  findCommunity: Community;
}

export interface FindCommunityVars {
  communityCode: string;
}

export interface CommunityData {
  community: Community;
}

export interface CommunityVars {
  communityId: string;
}

/// GET_USER_COMMUNITIES
export interface UserCommunitiesData {
  communities: Community[];
}

/// GET_COMMUNITY_AND_COMMUNITIES
export interface CommunityAndCommunitiesData {
  community?: Community;
  communities: Community[];
}

export interface CommunityAndCommunitiesVars {
  communityId: string;
}

/// CREATE_COMMUNITY
export interface CreateCommunityData {
  createCommunity: Community;
}

export interface CreateCommunityVars {
  communityInput: CreateCommunityInput;
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

/// GET_PAGINATED_POSTS
export interface PaginatedPostsData {
  paginatedPosts: {
    posts: Post[];
    hasMore: boolean;
  };
}

export interface PaginatedPostsVars {
  offset: number;
  limit: number;
  communityId: string;
}

/// GET_POST_AND_COMMUNITIES
export interface PostAndCommunitiesData {
  post: Post;
  communities: Community[];
}

export interface PostAndCommunitiesVars {
  postId: string;
}

/// CREATE_POST
export interface CreatePostData {
  createPost: Post;
}

export interface CreatePostVars {
  postInput: CreatePostInput;
  communityId: string;
}

/// UPDATE_POST
export interface UpdatePostData {
  updatePost: Post;
}

export interface UpdatePostVars {
  postInput: PostInput;
}

//   /// DELETE_POST
export interface DeletePostData {
  deletePost: boolean;
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

/// GET_PAGINATED_REQUESTS
export interface PaginatedRequestsData {
  paginatedRequests: {
    requests: Request[];
    hasMore: boolean;
  };
}

export interface PaginatedRequestsVars {
  offset: number;
  limit: number;
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
  requestInput: CreateRequestInput;
  communityId: string;
}

//   /// DELETE_REQUEST
export interface DeleteRequestData {
  deleteRequest: boolean;
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
}

export interface NotificationVars {
  notificationId: string;
}

/// GET_NOTIFICATIONS
export interface NotificationsData {
  notifications: Notification[];
}

export interface NotificationsVars {
  offset: number;
  limit: number;
  communityId: string;
}

/// FIND_NOTIFICATION
export interface FindNotificationData {
  findNotification: Notification;
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
  notificationInput: CreateNotificationInput;
}

///
/* BOOKING */
///

/// UPDATE_BOOKING
export interface UpdateBookingData {
  id: string;
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
  threadInput: CreateThreadInput;
}

///
/* MESSAGE */
///

/// CREATE_MESSAGE
export interface CreateMessageData {
  createMessage: Message;
}

export interface CreateMessageVars {
  messageInput: CreateMessageInput;
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
  communityActivities: Community;
}

export interface CommunityActivitiesVars {
  communityId: string;
}
