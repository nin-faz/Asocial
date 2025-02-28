import { gql } from "@apollo/client";

export interface Comment {
  id: number;
  content: string;
  author: {
    username: string;
    id: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface GetCommentsResponse {
  getComments: Comment[];
}

export interface GetCommentsVariables {
  articleId: string;
}

export const GET_COMMENTS = gql`
  query GetComments($articleId: ID!) {
    getComments(articleId: $articleId) {
      id
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
