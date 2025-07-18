import { graphql } from "../gql";
import { gql } from "@apollo/client";

export const CREATE_ARTICLE = graphql(`
  mutation CreateArticle(
    $title: String
    $content: String!
    $imageUrl: String
    $videoUrl: String
  ) {
    createArticle(
      title: $title
      content: $content
      imageUrl: $imageUrl
      videoUrl: $videoUrl
    ) {
      code
      success
      message
      article {
        id
        title
        content
        createdAt
        videoUrl
        updatedAt
        author {
          id
          username
        }
      }
    }
  }
`);

export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle(
    $id: ID!
    $title: String
    $content: String
    $imageUrl: String
    $videoUrl: String
  ) {
    updateArticle(
      id: $id
      title: $title
      content: $content
      imageUrl: $imageUrl
      videoUrl: $videoUrl
    ) {
      code
      success
      message
    }
  }
`;

export const DELETE_ARTICLE = graphql(`
  mutation deleteArticle($id: ID!) {
    deleteArticle(id: $id) {
      code
      success
      message
    }
  }
`);
