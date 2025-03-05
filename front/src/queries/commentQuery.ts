import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
  query GetComments($articleId: ID!) {
    getComments(articleId: $articleId) {
      id
      content
      author {
        username
        id
      }
    }
  }
`;
