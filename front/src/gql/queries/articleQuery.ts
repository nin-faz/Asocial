import { gql } from "@apollo/client";

export const FIND_ARTICLES = gql`
  query FindArticles {
    findArticles {
      id
      title
      content
      author {
        username
        id
      }
      createdAt
      updatedAt
    }
  }
`;

export const FIND_ARTICLE_BY_ID = gql`
  query FindArticleById($id: ID!) {
    findArticleById(id: $id) {
      id
      title
      content
      author {
        username
        id
      }
      createdAt
      updatedAt
    }
  }
`;
