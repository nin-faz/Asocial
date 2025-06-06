import { graphql } from "../gql";

export const RESET_PASSWORD = graphql(`
  mutation ResetPassword($username: String!, $newPassword: String!) {
    resetPassword(username: $username, newPassword: $newPassword) {
      code
      success
      message
    }
  }
`);
