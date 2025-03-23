import { graphql } from "../gql";

export const GET_COMMENTS = graphql(`
  query GetComments($articleId: ID!) {
    getComments(articleId: $articleId) {
      id
      content
      author {
        username
        id
      }
      createdAt
      dislikes {
        user {
          id
        }
      }
      TotalDislikes
    }
  }
`);
