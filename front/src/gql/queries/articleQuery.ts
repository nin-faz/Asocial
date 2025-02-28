import { gql } from "@apollo/client";

export const FIND_ARTICLES = gql`
  query FindArticles {
    findArticles {
      id
      title
      content
      author {
        username
      }
      createdAt
      updatedAt
    }
  }
`;
