import { graphql } from "../gql";

export const MARK_NOTIFICATIONS_AS_READ = graphql(`
  mutation MarkNotificationsAsRead($ids: [ID!]!) {
    markNotificationsAsRead(ids: $ids) {
      code
      success
      message
      notifications {
        id
        type
        message
        isRead
        createdAt
        articleId
        commentId
      }
    }
  }
`);
