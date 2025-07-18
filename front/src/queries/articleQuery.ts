import { graphql } from "../gql";

export const FIND_ARTICLES = graphql(`
  query FindArticles {
    findArticles {
      id
      title
      content
      imageUrl
      videoUrl
      author {
        id
        username
        iconName
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
      imageUrl
      videoUrl
      author {
        id
        username
        iconName
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
      imageUrl
      videoUrl
      author {
        id
        username
        iconName
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

export const FIND_ARTICLES_BY_USER = graphql(`
  query FindArticlesByUser($userId: ID!) {
    findArticlesByUser(userId: $userId) {
      id
      title
      content
      imageUrl
      videoUrl
      author {
        id
        username
        iconName
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
