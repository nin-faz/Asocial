import { graphql } from "../gql";

export const CREATE_USER = graphql(`
  mutation CreateUser($username: String!, $password: String!) {
    createUser(username: $username, password: $password) {
      success
      message
      user {
        username
      }
    }
  }
`);

export const SIGN_IN = graphql(`
  mutation SignIn($username: String!, $password: String!) {
    signIn(username: $username, password: $password) {
      success
      message
      token
    }
  }
`);

export const UPDATE_USER = graphql(`
  mutation UpdateUser($id: ID!, $body: userUpdateBody!) {
    updateUser(id: $id, body: $body) {
      success
      message
      user {
        id
        username
        bio
        iconName
        createdAt
        top1BadgeMessage
        top1BadgeColor
        top1BadgePreset
      }
    }
  }
`);
