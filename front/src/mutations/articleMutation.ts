import { graphql } from "../gql";

export const CREATE_ARTICLE = graphql(`
  mutation CreateArticle($title: String, $content: String!) {
    createArticle(title: $title, content: $content) {
      code
      success
      message
      article {
        id
        title
        content
        createdAt
        updatedAt
        author {
          id
          username
        }
      }
    }
  }
`);

export const UPDATE_ARTICLE = graphql(`
  mutation updateArticle($id: ID!, $title: String, $content: String!) {
    updateArticle(id: $id, title: $title, content: $content) {
      code
      success
      message
    }
  }
`);

export const DELETE_ARTICLE = graphql(`
  mutation deleteArticle($id: ID!) {
    deleteArticle(id: $id) {
      code
      success
      message
    }
  }
`);
