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
