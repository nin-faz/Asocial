import { gql } from "@apollo/client";

export const GET_USER_BY_TOKEN = gql`
  query GetUserbyToken($token: String!) {
    getUserbyToken(token: $token) {
      id
      username
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query FindUserById($id: ID!) {
    findUserById(id: $id) {
      id
      username
      bio
      createdAt
    }
  }
`;
