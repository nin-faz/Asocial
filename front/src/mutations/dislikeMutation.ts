import { gql } from "@apollo/client";

export const ADD_ARTICLE_DISLIKE = gql`
  mutation AddArticleDislike($articleId: ID!, $userId: ID!) {
    addArticleDislike(articleId: $articleId, userId: $userId) {
      id
      user {
        id
        username
      }
    }
  }
`;

export const DELETE_ARTICLE_DISLIKE = gql`
  mutation DeleteArticleDislike($articleId: ID!, $userId: ID!) {
    deleteArticleDislike(articleId: $articleId, userId: $userId) {
      code
      success
      message
    }
  }
`;
