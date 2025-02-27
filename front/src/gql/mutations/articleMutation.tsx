import { gql } from "@apollo/client";

export const CREATE_ARTICLE = gql`
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
        author {
          username
        }
      }
    }
  }
`;
