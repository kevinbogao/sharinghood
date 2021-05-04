import { gql } from "@apollo/client";

///
/* QUERIES */
///
export const queries = {
  ///
  /// LOCAL
  ///
  LOCAL_COMMUNITY: gql`
    query LocalCommunity {
      community(communityId: $communityId) @client {
        members {
          _id
          name
          image
        }
      }
    }
  `,

  ///
  /// USER
  ///
  GET_USER: gql`
    query GetUser {
      user {
        _id
        image
        name
        email
        apartment
        isAdmin
        communities {
          _id
        }
        posts {
          _id
          title
          image
        }
      }
    }
  `,

  VALIDATE_RESET_LINK: gql`
    query ValidateResetLink($resetKey: String!) {
      validateResetLink(resetKey: $resetKey)
    }
  `,

  ///
  /// COMMUNITY
  ///
  FIND_COMMUNITY: gql`
    query FindCommunity($communityCode: String!) {
      community(communityCode: $communityCode) {
        _id
      }
    }
  `,

  FIND_COMMUNITY_AND_MEMBERS: gql`
    query FindCommunityAndMembers($communityCode: String) {
      community(communityCode: $communityCode) {
        _id
        name
        code
        members {
          _id
          image
        }
      }
    }
  `,

  GET_USER_COMMUNITIES: gql`
    query Communities {
      communities {
        _id
        name
        hasNotifications
      }
    }
  `,

  GET_CURRENT_COMMUNITY_AND_COMMUNITIES: gql`
    query GetCurrentCommunityAndCommunities($communityId: ID) {
      community(communityId: $communityId) {
        _id
        name
        code
        creator {
          _id
        }
        members {
          _id
          name
          image
        }
      }
      communities {
        _id
        name
        hasNotifications
      }
    }
  `,

  ///
  /// POST
  ///
  GET_POST: gql`
    query Post($postId: ID!) {
      post(postId: $postId) {
        _id
        title
        desc
        image
        condition
        isGiveaway
        creator {
          _id
          name
          image
          apartment
          createdAt
        }
        threads {
          _id
          content
          poster {
            _id
          }
          community {
            _id
          }
        }
      }
    }
  `,

  GET_POST_DETAILS: gql`
    query GetPostDetails($postId: ID!) {
      post(postId: $postId) {
        _id
        title
        desc
        image
        condition
        isGiveaway
        creator {
          _id
          name
          image
          apartment
          createdAt
        }
        threads {
          _id
          content
          poster {
            _id
          }
          community {
            _id
          }
        }
      }
      community(communityId: $communityId) @client {
        members {
          _id
          name
          image
        }
      }
    }
  `,

  GET_POSTS: gql`
    query Posts($communityId: ID!) {
      posts(communityId: $communityId) {
        _id
        title
        image
        creator {
          _id
          name
        }
      }
    }
  `,

  GET_POST_AND_COMMUNITIES: gql`
    query GetPostAndCommunities($postId: ID!) {
      post(postId: $postId) {
        _id
        title
        desc
        image
        condition
        isGiveaway
        creator {
          _id
          name
        }
      }
      communities {
        _id
        name
        posts {
          _id
        }
      }
    }
  `,

  ///
  /// REQUEST
  ///
  GET_REQUEST: gql`
    query Request($requestId: ID!) {
      request(requestId: $requestId) {
        _id
        title
        desc
        image
        dateNeed
        dateReturn
        creator {
          _id
          name
          image
          apartment
          createdAt
        }
        threads {
          _id
          content
          poster {
            _id
          }
          community {
            _id
          }
        }
      }
    }
  `,

  GET_REQUEST_DETAILS: gql`
    query GetRequestDetails($requestId: ID!) {
      request(requestId: $requestId) {
        _id
        title
        desc
        image
        dateType
        dateNeed
        dateReturn
        creator {
          _id
          name
          image
          apartment
          createdAt
        }
        threads {
          _id
          content
          poster {
            _id
          }
          community {
            _id
          }
        }
      }
      community(communityId: $communityId) @client {
        members {
          _id
          name
          image
        }
      }
    }
  `,

  GET_REQUESTS: gql`
    query Requests($communityId: ID!) {
      requests(communityId: $communityId) {
        _id
        title
        desc
        image
        dateType
        dateNeed
        creator {
          _id
          name
        }
      }
    }
  `,

  ///
  /// NOTIFICATION
  ///
  GET_NOTIFICATION: gql`
    query GetNotification($notificationId: ID!) {
      notification(notificationId: $notificationId) {
        _id
        ofType
        booking {
          _id
          status
          dateType
          dateNeed
          dateReturn
          post {
            _id
            title
            image
          }
          booker {
            _id
          }
        }
        post {
          _id
        }
        participants {
          _id
          name
          image
        }
        messages {
          _id
          text
          sender {
            _id
          }
          createdAt
        }
        isRead
      }
      community(communityId: $communityId) @client {
        members {
          _id
          name
          image
        }
      }
    }
  `,

  GET_NOTIFICATIONS: gql`
    query GetNotifications($communityId: ID!) {
      notifications(communityId: $communityId) {
        _id
        ofType
        booking {
          _id
          status
          dateType
          dateNeed
          dateReturn
          post {
            _id
            title
            image
          }
          booker {
            _id
          }
        }
        post {
          _id
          creator {
            _id
            name
          }
        }
        participants {
          _id
          name
          image
        }
        isRead
        community {
          _id
        }
        messages {
          _id
          text
        }
      }
    }
  `,

  FIND_NOTIFICATION: gql`
    query FindNotification($recipientId: ID!, $communityId: ID!) {
      findNotification(recipientId: $recipientId, communityId: $communityId) {
        _id
      }
    }
  `,

  ///
  /// ACTIVITY
  ///
  GET_ACTIVITIES: gql`
    query GetActivities {
      totalActivities {
        totalCommunities
        totalUsers
        totalPosts
        totalRequests
        totalBookings
        communitiesActivities {
          _id
          name
          code
          numUsers
          numPosts
          numRequests
          numBookings
        }
      }
    }
  `,

  GET_COMMUNITY_ACTIVITIES: gql`
    query CommunityActivities($communityId: ID!) {
      communityActivities(communityId: $communityId) {
        _id
        name
        code
        zipCode
        creator {
          _id
        }
        members {
          _id
          name
          email
          image
          isNotified
          createdAt
          lastLogin
        }
        posts {
          _id
          title
          desc
          condition
          image
          isGiveaway
          creator {
            _id
          }
          createdAt
        }
        requests {
          _id
          title
          desc
          dateType
          dateNeed
          dateReturn
          image
          creator {
            _id
          }
          createdAt
        }
        bookings {
          _id
          post {
            _id
          }
          status
          dateType
          dateNeed
          dateReturn
          booker {
            _id
          }
        }
      }
    }
  `,
};

///
/* MUTATIONS */
///
export const mutations = {
  ///
  /// USER
  ///
  LOGIN: gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        accessToken
        refreshToken
      }
    }
  `,

  LOGOUT: gql`
    mutation Logout {
      logout
    }
  `,

  UPDATE_USER: gql`
    mutation UpdateUser($userInput: UserInput) {
      updateUser(userInput: $userInput) {
        _id
        name
        image
        email
        apartment
      }
    }
  `,

  FORGOT_PASSWORD: gql`
    mutation ForgotPassword($email: String!) {
      forgotPassword(email: $email)
    }
  `,

  RESET_PASSWORD: gql`
    mutation ResetPassword($resetKey: String!, $password: String!) {
      resetPassword(resetKey: $resetKey, password: $password)
    }
  `,

  ADD_FCM_TOKEN_TO_USER: gql`
    mutation AddFcmToken($fcmToken: String!) {
      addFcmToken(fcmToken: $fcmToken)
    }
  `,

  ///
  /// USER & COMMUNITY
  ///
  REGISTER_AND_OR_CREATE_COMMUNITY: gql`
    mutation RegisterAndOrCreateCommunity(
      $userInput: UserInput!
      $communityInput: CommunityInput
    ) {
      registerAndOrCreateCommunity(
        communityInput: $communityInput
        userInput: $userInput
      ) {
        user {
          accessToken
          refreshToken
        }
        community {
          _id
          name
          code
        }
      }
    }
  `,

  ///
  /// COMMUNITY
  ///
  CREATE_COMMUNITY: gql`
    mutation CreateCommunity($communityInput: CommunityInput!) {
      createCommunity(communityInput: $communityInput) {
        _id
      }
    }
  `,

  JOIN_COMMUNITY: gql`
    mutation JoinCommunity($communityId: ID!) {
      joinCommunity(communityId: $communityId) {
        _id
        name
      }
    }
  `,

  ///
  /// POST
  ///
  CREATE_POST: gql`
    mutation CreatePost($postInput: PostInput!, $communityId: ID) {
      createPost(postInput: $postInput, communityId: $communityId) {
        _id
        title
        desc
        image
        creator {
          _id
          name
        }
      }
    }
  `,

  UPDATE_POST: gql`
    mutation UpdatePost($postInput: PostInput!) {
      updatePost(postInput: $postInput) {
        _id
        title
        image
        condition
      }
    }
  `,

  INACTIVATE_POST: gql`
    mutation InactivatePost($postId: ID!) {
      inactivatePost(postId: $postId)
    }
  `,

  DELETE_POST: gql`
    mutation DeletePost($postId: ID!) {
      deletePost(postId: $postId) {
        _id
      }
    }
  `,

  ADD_POST_TO_COMMUNITY: gql`
    mutation AddPostToCommunity($postId: ID!, $communityId: ID!) {
      addPostToCommunity(postId: $postId, communityId: $communityId) {
        _id
      }
    }
  `,

  ///
  /// REQUEST
  ///
  CREATE_REQUEST: gql`
    mutation CreateRequest($requestInput: RequestInput!, $communityId: ID!) {
      createRequest(requestInput: $requestInput, communityId: $communityId) {
        _id
        desc
        image
        dateNeed
        creator {
          _id
          name
        }
      }
    }
  `,

  DELETE_REQUEST: gql`
    mutation DeleteRequest($requestId: ID!) {
      deleteRequest(requestId: $requestId) {
        _id
      }
    }
  `,

  ///
  /// THREAD
  ///
  CREATE_THREAD: gql`
    mutation CreateThread($threadInput: ThreadInput!) {
      createThread(threadInput: $threadInput) {
        _id
        content
        poster {
          _id
        }
        community {
          _id
        }
      }
    }
  `,

  ///
  /// MESSAGE
  ///
  CREATE_MESSAGE: gql`
    mutation CreateMessage($messageInput: MessageInput!) {
      createMessage(messageInput: $messageInput) {
        _id
        text
        sender {
          _id
        }
        createdAt
      }
    }
  `,

  ///
  /// BOOKING
  ///
  UPDATE_BOOKING: gql`
    mutation UpdateBooking($bookingInput: BookingInput!) {
      updateBooking(bookingInput: $bookingInput) {
        _id
        status
      }
    }
  `,

  ///
  /// NOTIFICATION
  ///
  CREATE_NOTIFICATION: gql`
    mutation CreateNotification($notificationInput: NotificationInput) {
      createNotification(notificationInput: $notificationInput) {
        _id
        ofType
        booking {
          _id
          status
          dateType
          dateNeed
          dateReturn
          post {
            _id
            title
            image
          }
          booker {
            _id
          }
        }
        participants {
          _id
          name
          image
        }
        isRead
        messages {
          _id
          text
        }
      }
    }
  `,
};

///
/* SUBSCRIPTIONS  */
///
export const subscriptions = {
  ///
  /// MESSAGE
  ///
  MESSAGES_SUBSCRIPTION: gql`
    subscription onNewNotificationMessage($notificationId: ID!) {
      newNotificationMessage(notificationId: $notificationId) {
        _id
        text
        createdAt
        sender {
          _id
        }
      }
    }
  `,
};

export interface Booking {
  _id: string;
  status: number;
  dateType: number;
  dateNeed: Date;
  dateReturn: Date;
  post: Post;
  booker: User;
  community: Community;
}

export interface Community {
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
  _id: string;
  text: string;
  sender: User;
  notification: Notification;
}

export interface Notification {
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
  _id: string;
  content: string;
  poster: User;
  community: Community;
}

export interface User {
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
}
