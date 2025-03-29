import { graphql } from "../gql";

export const GET_USER_BY_TOKEN = graphql(`
  query GetUserbyToken($token: String!) {
    getUserbyToken(token: $token) {
      id
      username
    }
  }
`);

export const GET_USER_BY_ID = graphql(`
  query GetUserById($id: ID!) {
    findUserById(id: $id) {
      id
      username
      bio
      iconName
      createdAt
      TotalDislikes
      TotalComments
    }
  }
`);
