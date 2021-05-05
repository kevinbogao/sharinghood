import { gql } from "@apollo/client";

///
/* QUERIES */
///
export namespace queries {
  ///
  /// LOCAL
  ///
  export const LOCAL_COMMUNITY = gql`
    query LocalCommunity {
      community(communityId: $communityId) @client {
        members {
          _id
          name
          image
        }
      }
    }
  `;

  ///
  /// USER
  ///
  export const GET_USER = gql`
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
  `;

  export const VALIDATE_RESET_LINK = gql`
    query ValidateResetLink($resetKey: String!) {
      validateResetLink(resetKey: $resetKey)
    }
  `;

  ///
  /// COMMUNITY
  ///
  export const FIND_COMMUNITY = gql`
    query FindCommunity($communityCode: String!) {
      community(communityCode: $communityCode) {
        _id
      }
    }
  `;

  export const FIND_COMMUNITY_AND_MEMBERS = gql`
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
  `;

  export const GET_USER_COMMUNITIES = gql`
    query Communities {
      communities {
        _id
        name
        hasNotifications
      }
    }
  `;

  export const GET_CURRENT_COMMUNITY_AND_COMMUNITIES = gql`
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
  `;

  ///
  /// POST
  ///
  export const GET_POST = gql`
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
  `;

  export const GET_POST_DETAILS = gql`
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
  `;

  export const GET_POSTS = gql`
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
  `;

  export const GET_POST_AND_COMMUNITIES = gql`
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
  `;

  ///
  /// REQUEST
  ///
  export const GET_REQUEST = gql`
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
  `;

  export const GET_REQUEST_DETAILS = gql`
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
  `;

  export const GET_REQUESTS = gql`
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
  `;

  ///
  /// NOTIFICATION
  ///
  export const GET_NOTIFICATION = gql`
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
  `;

  export const GET_NOTIFICATIONS = gql`
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
  `;

  export const FIND_NOTIFICATION = gql`
    query FindNotification($recipientId: ID!, $communityId: ID!) {
      findNotification(recipientId: $recipientId, communityId: $communityId) {
        _id
      }
    }
  `;

  ///
  /// ACTIVITY
  ///
  export const GET_ACTIVITIES = gql`
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
  `;

  export const GET_COMMUNITY_ACTIVITIES = gql`
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
  `;
}

///
/* MUTATIONS */
///
export namespace mutations {
  ///
  /// USER
  ///
  export const LOGIN = gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        accessToken
        refreshToken
      }
    }
  `;

  export const LOGOUT = gql`
    mutation Logout {
      logout
    }
  `;

  export const UPDATE_USER = gql`
    mutation UpdateUser($userInput: UserInput) {
      updateUser(userInput: $userInput) {
        _id
        name
        image
        email
        apartment
      }
    }
  `;

  export const FORGOT_PASSWORD = gql`
    mutation ForgotPassword($email: String!) {
      forgotPassword(email: $email)
    }
  `;

  export const RESET_PASSWORD = gql`
    mutation ResetPassword($resetKey: String!, $password: String!) {
      resetPassword(resetKey: $resetKey, password: $password)
    }
  `;

  export const ADD_FCM_TOKEN_TO_USER = gql`
    mutation AddFcmToken($fcmToken: String!) {
      addFcmToken(fcmToken: $fcmToken)
    }
  `;

  ///
  /// USER & COMMUNITY
  ///
  export const REGISTER_AND_OR_CREATE_COMMUNITY = gql`
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
  `;

  ///
  /// COMMUNITY
  ///
  export const CREATE_COMMUNITY = gql`
    mutation CreateCommunity($communityInput: CommunityInput!) {
      createCommunity(communityInput: $communityInput) {
        _id
      }
    }
  `;

  export const JOIN_COMMUNITY = gql`
    mutation JoinCommunity($communityId: ID!) {
      joinCommunity(communityId: $communityId) {
        _id
        name
      }
    }
  `;

  ///
  /// POST
  ///
  export const CREATE_POST = gql`
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
  `;

  export const UPDATE_POST = gql`
    mutation UpdatePost($postInput: PostInput!) {
      updatePost(postInput: $postInput) {
        _id
        title
        desc
        image
        condition
      }
    }
  `;

  export const INACTIVATE_POST = gql`
    mutation InactivatePost($postId: ID!) {
      inactivatePost(postId: $postId)
    }
  `;

  export const DELETE_POST = gql`
    mutation DeletePost($postId: ID!) {
      deletePost(postId: $postId) {
        _id
      }
    }
  `;

  export const ADD_POST_TO_COMMUNITY = gql`
    mutation AddPostToCommunity($postId: ID!, $communityId: ID!) {
      addPostToCommunity(postId: $postId, communityId: $communityId) {
        _id
      }
    }
  `;

  ///
  /// REQUEST
  ///
  export const CREATE_REQUEST = gql`
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
  `;

  export const DELETE_REQUEST = gql`
    mutation DeleteRequest($requestId: ID!) {
      deleteRequest(requestId: $requestId) {
        _id
      }
    }
  `;

  ///
  /// THREAD
  ///
  export const CREATE_THREAD = gql`
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
  `;

  ///
  /// MESSAGE
  ///
  export const CREATE_MESSAGE = gql`
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
  `;

  ///
  /// BOOKING
  ///
  export const UPDATE_BOOKING = gql`
    mutation UpdateBooking($bookingInput: BookingInput!) {
      updateBooking(bookingInput: $bookingInput) {
        _id
        status
      }
    }
  `;

  ///
  /// NOTIFICATION
  ///
  export const CREATE_NOTIFICATION = gql`
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
  `;
}

///
/* SUBSCRIPTIONS  */
///
export namespace subscriptions {
  ///
  /// MESSAGE
  ///
  export const MESSAGES_SUBSCRIPTION = gql`
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
  `;
}

export namespace typeDefs {
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

  export interface PostsData {
    posts: Array<Post>;
  }

  export interface PostsVars {
    communityId: string;
  }

  export interface RequestsData {
    requests: Array<Request>;
  }

  export interface RequestsVars {
    communityId: string;
  }

  export interface PostDetailsData {
    post: Post;
    community: Community;
  }

  export interface PostDetailsVars {
    postId: string;
    communityId: string;
  }

  export interface PostAndCommunitiesData {
    post: Post;
    communities: Array<Community>;
  }

  export interface PostAndCommunitiesVars {
    postId: string;
  }

  export interface FindNotificationData {
    findNotification: typeDefs.Notification;
  }

  export interface FindNotificationVars {
    recipientId: string;
    communityId: string;
  }
}
