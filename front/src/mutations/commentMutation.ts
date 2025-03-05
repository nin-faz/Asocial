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

export const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      code
      success
      message
    }
  }
`;
