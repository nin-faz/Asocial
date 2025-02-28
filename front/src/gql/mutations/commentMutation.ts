import { gql } from "@apollo/client";

export const ADD_COMMENT = gql`
  mutation AddComment($content: String!, $userId: ID!, $articleId: ID!) {
    addComment(content: $content, userId: $userId, articleId: $articleId) {
      id
      content
      author {
        id
        username
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($articleId: ID!, $content: String!) {
    createComment(articleId: $articleId, content: $content) {
      code
      success
      message
      comment {
        id
        content
        author {
          id
          username
        }
        createdAt
      }
    }
  }
`;

