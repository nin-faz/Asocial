import { graphql } from "../gql";

export const ADD_ARTICLE_DISLIKE = graphql(`
  mutation AddArticleDislike($articleId: ID!, $userId: ID!) {
    addArticleDislike(articleId: $articleId, userId: $userId) {
      id
      article {
        id
      }
      user {
        id
        username
      }
    }
  }
`);

export const DELETE_ARTICLE_DISLIKE = graphql(`
  mutation DeleteArticleDislike($articleId: ID!, $userId: ID!) {
    deleteArticleDislike(articleId: $articleId, userId: $userId) {
      code
      success
      message
    }
  }
`);

export const ADD_COMMENT_DISLIKE = graphql(`
  mutation AddCommentDislike($commentId: ID!, $userId: ID!) {
    addCommentDislike(commentId: $commentId, userId: $userId) {
      id
    }
  }
`);

export const DELETE_COMMENT_DISLIKE = graphql(`
  mutation DeleteCommentDislike($commentId: ID!, $userId: ID!) {
    deleteCommentDislike(commentId: $commentId, userId: $userId) {
      code
      success
      message
    }
  }
`);
