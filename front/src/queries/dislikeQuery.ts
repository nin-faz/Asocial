import { graphql } from "../gql";

export const FIND_DISLIKES_BY_USER_ID = graphql(`
  query FindDislikesByArticleId($userId: ID!) {
    getDislikesByUserId(userId: $userId) {
      user {
        id
        username
      }
      article {
        id
        title
        content
        createdAt
        updatedAt
        author {
          username
          id
        }
      }
    }
  }
`);
