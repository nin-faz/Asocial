import { graphql } from "../gql";

export const FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES = graphql(`
  query FindDislikesByUserIdForArticles($userId: ID!) {
    getDislikesByUserIdForArticles(userId: $userId) {
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
          iconName
        }
      }
    }
  }
`);

export const FIND_DISLIKES_BY_USER_ID_FOR_COMMENTS = graphql(`
  query FindDislikesByUserIdForComments($userId: ID!) {
    getDislikesByUserIdForComments(userId: $userId) {
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
