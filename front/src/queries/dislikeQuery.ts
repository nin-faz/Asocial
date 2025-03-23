import { graphql } from "../gql";

export const FIND_DISLIKES_BY_USER_ID_FOR_ARTICLE = graphql(`
  query FindDislikesByUserIdForArticle($userId: ID!) {
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

export const FIND_DISLIKES_BY_USER_ID_FOR_COMMENT = graphql(`
  query FindDislikesByUserIdForComment($userId: ID!) {
    getDislikesByUserId(userId: $userId) {
      user {
        id
        username
      }
      comment {
        id
        content
        createdAt
        author {
          username
          id
        }
      }
    }
  }
`);
