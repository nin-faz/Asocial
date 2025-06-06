import { graphql } from "../gql";

export const GET_COMMENTS = graphql(`
  query GetComments($articleId: ID!) {
    getComments(articleId: $articleId) {
      id
      content
      isReply
      author {
        id
        username
        iconName
      }
      createdAt
      updatedAt
      dislikes {
        user {
          id
        }
      }
      TotalDislikes
      parent {
        id
        content
        author {
          username
        }
      }
      replies {
        id
        content
        author {
          id
          username
          iconName
        }
        createdAt
        updatedAt
      }
    }
  }
`);
