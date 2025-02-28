import { gql } from "graphql-tag";

export const CREATE_USER = gql`
  mutation CreateUser($username: String!, $password: String!) {
    createUser(username: $username, password: $password) {
      success
      message
      user {
        username
      }
    }
  }
`;

export const SIGN_IN = gql`
  mutation SignIn($username: String!, $password: String!) {
    signIn(username: $username, password: $password) {
      success
      message
      token
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $body: userUpdateBody!) {
    updateUser(id: $id, body: $body) {
      success
      message
      user {
        id
        username
        bio
        createdAt
      }
    }
  }
`;
