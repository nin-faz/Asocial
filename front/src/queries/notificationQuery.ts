import { graphql } from "../gql";

export const GET_NOTIFICATIONS = graphql(`
  query GetNotifications($userId: ID!) {
    getNotifications(userId: $userId) {
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
