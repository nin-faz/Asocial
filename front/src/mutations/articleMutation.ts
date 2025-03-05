import { gql } from "@apollo/client";
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
