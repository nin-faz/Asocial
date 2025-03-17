import { gql } from "@apollo/client";
import { graphql } from "../gql";

export const FIND_ARTICLES = graphql(`
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
      TotalDislikes
      TotalComments
      dislikes {
        id
      }
    }
  }
`);

export const FIND_ARTICLE_BY_ID = graphql(`
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
`);

export const FIND_ARTICLE_BY_MOST_DISLIKED = graphql(`
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
`);
