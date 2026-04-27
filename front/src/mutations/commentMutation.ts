import { graphql } from "../gql";

export const ADD_COMMENT = graphql(`
  mutation AddComment(
    $content: String!
    $articleId: ID!
    $parentId: ID
  ) {
    addComment(
      content: $content
      articleId: $articleId
      parentId: $parentId
    ) {
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

export const DELETE_COMMENT = graphql(`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      code
      success
      message
    }
  }
`);

export const UPDATE_COMMENT = graphql(`
  mutation UpdateComment($commentId: ID!, $content: String!) {
    updateComment(commentId: $commentId, content: $content) {
      code
      success
      message
    }
  }
`);
