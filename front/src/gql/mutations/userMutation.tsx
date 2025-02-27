import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation CreateUser($username: String!, $password: String!) {
    createUser(username: $username, password: $password) {
      success
      message
      user {
        id
        username
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation SignIn($username: String!, $password: String!) {
    signIn(username: $username, password: $password) {
      success
      message
      token
    }
  }
`;
