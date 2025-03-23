import { graphql } from "../gql";

export const FIND_ARTICLES = graphql(`
  query FindArticles {
    findArticles {
      id
      title
      content
      author {
        id
        username
      }
      createdAt
      updatedAt
      TotalDislikes
      TotalComments
      dislikes {
        id
        user {
          id
        }
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
        id
        username
      }
      createdAt
      updatedAt
      TotalDislikes
      TotalComments
      dislikes {
        id
        user {
          id
        }
      }
    }
  }
`);

export const FIND_ARTICLE_BY_MOST_DISLIKED = graphql(`
  query FindArticleByMostDisliked {
    findArticleByMostDisliked {
      id
      title
      content
      author {
        id
        username
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
