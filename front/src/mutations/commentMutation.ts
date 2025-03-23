import { graphql } from "../gql";

export const ADD_COMMENT = graphql(`
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
`);

export const DELETE_COMMENT = graphql(`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      code
      success
      message
    }
  }
`);
