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
      NbOfDislikes
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

export const FIND_ARTICLE_BY_MOST_DISLIKED = gql`
  query FindArticleByMostDisliked {
    findArticleByMostDisliked {
      id
      title
      content
      createdAt
      updatedAt
      author {
        id
        username
      }
      dislikes {
        id
        user {
          id
          username
        }
      }
      _count {
        dislikes
      }
    }
  }
`;
