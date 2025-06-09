import { graphql } from "../gql";

export const GET_NOTIFICATIONS = graphql(`
  query GetNotifications($userId: ID!, $limit: Int, $offset: Int) {
    getNotifications(userId: $userId, limit: $limit, offset: $offset) {
      id
      type
      message
      isRead
      createdAt
      articleId
      commentId
    }
  }
`);
