import { gql } from "@apollo/client";

///
/* QUERIES */
///
export namespace queries {
  ///
  /// USER
  ///
  export const GET_USER = gql`
    query GetUser {
      user {
        id
        imageUrl
        name
        email
        apartment
        isAdmin
        isNotified
        posts {
          id
          title
          imageUrl
        }
      }
    }
  `;

  export const UNSUBSCRIBE_USER = gql`
    query UnsubscribeUser($userId: String!, $token: String!) {
      unsubscribeUser(userId: $userId, token: $token)
    }
  `;

  ///
  /// COMMUNITY
  ///
  export const FIND_COMMUNITY = gql`
    query FindCommunity($communityCode: String!) {
      findCommunity(communityCode: $communityCode) {
        id
        name
        code
        members {
          id
        }
      }
    }
  `;

  export const GET_COMMUNITY_AND_MEMBERS = gql`
    query GetCommunityAndMembers($communityId: ID!) {
      community(communityId: $communityId) {
        id
        name
        code
        members {
          id
          name
          imageUrl
        }
      }
    }
  `;

  export const GET_USER_COMMUNITIES = gql`
    query GetUserCommunities {
      communities {
        id
        name
        notificationCount
      }
    }
  `;

  export const GET_COMMUNITY_AND_COMMUNITIES = gql`
    query GetCommunityAndCommunities($communityId: ID!) {
      community(communityId: $communityId) {
        id
        name
        code
        creator {
          id
        }
        members {
          id
          name
          imageUrl
        }
      }
      communities {
        id
        name
        notificationCount
      }
    }
  `;

  export const VALIDATE_RESET_LINK = gql`
    query ValidateResetLink($resetKey: String!) {
      validateResetLink(resetKey: $resetKey)
    }
  `;

  ///
  /// POST
  ///
  export const GET_POST_DETAILS = gql`
    query GetPostDetails($postId: ID!, $communityId: ID!) {
      post(postId: $postId) {
        id
        title
        desc
        imageUrl
        condition
        isGiveaway
        bookings {
          id
          timeFrame
          dateNeed
          dateReturn
        }
        creator {
          id
          name
          imageUrl
          apartment
          # createdAt
        }
        threads {
          id
          content
          creator {
            id
          }
          community {
            id
          }
        }
      }
      community(communityId: $communityId) {
        id
        members {
          id
          name
          imageUrl
        }
      }
    }
  `;

  export const GET_PAGINATED_POSTS = gql`
    query PaginatedPosts($offset: Int!, $limit: Int!, $communityId: ID!) {
      paginatedPosts(
        offset: $offset
        limit: $limit
        communityId: $communityId
      ) {
        posts {
          id
          title
          imageUrl
          creator {
            id
            name
          }
        }
        hasMore
      }
    }
  `;

  export const GET_POST_AND_COMMUNITIES = gql`
    query GetPostAndCommunities($postId: ID!) {
      post(postId: $postId) {
        id
        title
        desc
        imageUrl
        condition
        isGiveaway
        creator {
          id
          name
        }
      }
      communities {
        id
        name
        posts {
          id
        }
      }
    }
  `;

  ///
  /// REQUEST
  ///
  export const GET_REQUEST_DETAILS = gql`
    query GetRequestDetails($requestId: ID!, $communityId: ID!) {
      request(requestId: $requestId) {
        id
        title
        desc
        imageUrl
        timeFrame
        dateNeed
        dateReturn
        creator {
          id
          name
          imageUrl
          apartment
          createdAt
        }
        threads {
          id
          content
          creator {
            id
          }
          community {
            id
          }
        }
      }
      community(communityId: $communityId) {
        id
        members {
          id
          name
          imageUrl
        }
      }
    }
  `;

  export const GET_PAGINATED_REQUESTS = gql`
    query PaginatedRequests($offset: Int!, $limit: Int!, $communityId: ID!) {
      paginatedRequests(
        offset: $offset
        limit: $limit
        communityId: $communityId
      ) {
        requests {
          id
          title
          desc
          imageUrl
          timeFrame
          dateNeed
          creator {
            id
            name
          }
        }
        hasMore
      }
    }
  `;

  ///
  /// NOTIFICATION
  ///
  export const GET_NOTIFICATION = gql`
    query GetNotification(
      $notificationId: ID!
      $msgOffset: Int
      $msgLimit: Int
    ) {
      notification(notificationId: $notificationId) {
        id
        type
        booking {
          id
          status
          timeFrame
          dateNeed
          dateReturn
          post {
            id
            title
            imageUrl
          }
          booker {
            id
          }
        }
        post {
          id
        }
        creator {
          id
          name
          imageUrl
        }
        recipient {
          id
          name
          imageUrl
        }
        paginatedMessages(offset: $msgOffset, limit: $msgLimit) {
          messages {
            id
            content
            creator {
              id
            }
            createdAt
          }
          hasMore
        }
        # Ensure notifier deletion
        notifier {
          id
        }
      }
    }
  `;

  export const GET_PAGINATED_NOTIFICATIONS = gql`
    query GetPaginatedNotifications(
      $offset: Int!
      $limit: Int!
      $communityId: ID!
    ) {
      paginatedNotifications(
        offset: $offset
        limit: $limit
        communityId: $communityId
      ) {
        notifications {
          id
          type
          booking {
            id
            status
            timeFrame
            dateNeed
            dateReturn
            post {
              id
              title
              imageUrl
            }
            booker {
              id
            }
          }
          post {
            id
            creator {
              id
              name
            }
          }
          creator {
            id
            name
            imageUrl
          }
          recipient {
            id
            name
            imageUrl
          }
          notifier {
            id
          }
          community {
            id
          }
          paginatedMessages(offset: 0, limit: 1) {
            messages {
              id
              content
            }
          }
        }
        hasMore
      }
    }
  `;

  export const FIND_NOTIFICATION = gql`
    query FindNotification($recipientId: ID!, $communityId: ID!) {
      findNotification(recipientId: $recipientId, communityId: $communityId) {
        id
      }
    }
  `;

  ///
  /// ACTIVITY
  ///
  export const GET_TOTAl_ACTIVITIES = gql`
    query GetTotalActivities {
      totalActivities {
        totalCommunitiesCount
        totalUsersCount
        totalPostsCount
        totalRequestsCount
        totalBookingsCount
        communitiesActivities {
          id
          name
          code
          membersCount
          postsCount
          requestsCount
          bookingsCount
        }
      }
    }
  `;

  export const GET_COMMUNITY_ACTIVITIES = gql`
    query CommunityActivities($communityId: ID!) {
      communityActivities(communityId: $communityId) {
        id
        name
        code
        zipCode
        creator {
          id
        }
        members {
          id
          name
          email
          imageUrl
          isNotified
          createdAt
          lastLogin
        }
        posts {
          id
          title
          desc
          condition
          imageUrl
          isGiveaway
          creator {
            id
          }
          createdAt
        }
        requests {
          id
          title
          desc
          timeFrame
          dateNeed
          dateReturn
          imageUrl
          creator {
            id
          }
          createdAt
        }
        bookings {
          id
          post {
            id
          }
          status
          timeFrame
          dateNeed
          dateReturn
          booker {
            id
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
    mutation UpdateUser($userInput: UserInput!) {
      updateUser(userInput: $userInput) {
        id
        name
        imageUrl
        email
        apartment
        isNotified
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

  export const REGISTER = gql`
    mutation Register($userInput: UserInput!, $communityInput: CommunityInput) {
      register(userInput: $userInput, communityInput: $communityInput) {
        auth {
          accessToken
          refreshToken
        }
        community {
          id
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
        id
      }
    }
  `;

  export const JOIN_COMMUNITY = gql`
    mutation JoinCommunity($communityId: ID!) {
      joinCommunity(communityId: $communityId) {
        id
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
        id
        title
        desc
        imageUrl
        creator {
          id
          name
        }
      }
    }
  `;

  export const UPDATE_POST = gql`
    mutation UpdatePost($postInput: PostInput!) {
      updatePost(postInput: $postInput) {
        id
        title
        desc
        imageUrl
        condition
        isGiveaway
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
      deletePost(postId: $postId)
    }
  `;

  export const ADD_POST_TO_COMMUNITY = gql`
    mutation AddPostToCommunity($postId: ID!, $communityId: ID!) {
      addPostToCommunity(postId: $postId, communityId: $communityId) {
        id
      }
    }
  `;

  ///
  /// REQUEST
  ///
  export const CREATE_REQUEST = gql`
    mutation CreateRequest($requestInput: RequestInput!, $communityId: ID!) {
      createRequest(requestInput: $requestInput, communityId: $communityId) {
        id
        title
        desc
        imageUrl
        timeFrame
        dateNeed
        dateReturn
        creator {
          id
          name
        }
      }
    }
  `;

  export const DELETE_REQUEST = gql`
    mutation DeleteRequest($requestId: ID!) {
      deleteRequest(requestId: $requestId)
    }
  `;

  ///
  /// THREAD
  ///
  export const CREATE_THREAD = gql`
    mutation CreateThread($threadInput: ThreadInput!) {
      createThread(threadInput: $threadInput) {
        id
        content
        creator {
          id
        }
        community {
          id
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
        id
        content
        creator {
          id
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
        id
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
        id
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
    subscription NotificationMessage($notificationId: ID!) {
      notificationMessage(notificationId: $notificationId) {
        id
        content
        createdAt
        creator {
          id
        }
      }
    }
  `;
}
