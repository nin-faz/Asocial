import { graphql } from "../gql";

export const REQUEST_PASSWORD_RESET = graphql(`
  mutation RequestPasswordReset($email: String!, $username: String!) {
    requestPasswordReset(email: $email, username: $username) {
      code
      success
      message
    }
  }
`);

export const RESET_PASSWORD_WITH_TOKEN = graphql(`
  mutation ResetPasswordWithToken(
    $token: String!
    $username: String!
    $newPassword: String!
  ) {
    resetPasswordWithToken(
      token: $token
      username: $username
      newPassword: $newPassword
    ) {
      code
      success
      message
    }
  }
`);
