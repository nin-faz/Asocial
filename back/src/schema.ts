import gql from "graphql-tag";

export const typeDefs = gql`
  type Query {
    findUserById(id: ID!): UserSummary
    findArticles: [Article]
    findArticleById(id: ID!): Article
    findArticleByMostDisliked: [Article]
    findArticlesByUser(userId: ID!): [Article!]!
    getUserbyToken(token: String!): UserToken
    getDislikesByArticleId(articleId: ID!): [Dislike]
    getDislikesByCommentId(commentId: ID!): [Dislike]
    getDislikesByUserIdForArticles(userId: ID!): [Dislike]
    getDislikesByUserIdForComments(userId: ID!): [Dislike]
    getComments(articleId: ID!): [Comment]
  }

  type Mutation {
    createUser(username: String!, password: String!): CreateUserResponse!
    signIn(username: String!, password: String!): SignInResponse!
    updateUser(id: ID!, body: userUpdateBody!): updateUserResponse!

    createArticle(
      title: String
      content: String!
      imageUrl: String
    ): CreateArticleResponse!
    updateArticle(
      id: ID!
      title: String
      content: String
      imageUrl: String
    ): UpdateArticleResponse!
    deleteArticle(id: ID!): DeleteArticleResponse!

    deleteArticleDislike(articleId: ID!, userId: ID!): DeleteDislikeResponse
    deleteCommentDislike(commentId: ID!, userId: ID!): DeleteDislikeResponse
    addArticleDislike(articleId: ID!, userId: ID!): Dislike
    addCommentDislike(commentId: ID!, userId: ID!): Dislike

    addComment(
      content: String!
      userId: ID!
      articleId: ID!
      parentId: ID
    ): Comment
    deleteComment(commentId: ID!): DeleteCommentResponse
    updateComment(commentId: ID!, content: String!): CommentUpdateResponse
    requestPasswordReset(
      email: String!
      username: String!
    ): RequestPasswordResetResponse!
    resetPasswordWithToken(
      token: String!
      username: String!
      newPassword: String!
    ): ResetPasswordWithTokenResponse!
  }

  type DeleteDislikeResponse {
    code: Int!
    success: Boolean!
    message: String!
  }

  type DeleteCommentResponse {
    code: Int!
    success: Boolean!
    message: String!
  }

  type UserSummary {
    id: ID!
    username: String!
    bio: String
    iconName: String
    createdAt: String!
    TotalDislikes: Int
    TotalComments: Int
  }

  type CreateUserResponse {
    code: Int!
    success: Boolean!
    message: String!
    user: UserSummary
  }
  type SignInResponse {
    code: Int!
    success: Boolean!
    message: String!
    token: String
  }

  type updateUserResponse {
    code: Int!
    success: Boolean!
    message: String!
    user: UserSummary
  }

  input userUpdateBody {
    bio: String
    username: String
    password: String
    iconName: String
  }

  type CreateArticleResponse {
    code: Int!
    success: Boolean!
    message: String!
    article: Article
  }
  type UpdateArticleResponse {
    code: Int!
    success: Boolean!
    message: String!
  }
  type DeleteArticleResponse {
    code: Int!
    success: Boolean!
    message: String!
  }
  type User {
    id: ID!
    username: String!
    articles: [Article]
    comments: [Comment]
    dislikes: [Dislike]
    bio: String
    iconName: String
    createdAt: String!
  }

  type UserToken {
    id: ID!
    username: String!
  }

  type Dislike {
    id: ID!
    user: User
    article: Article
    comment: Comment
  }

  type Article {
    id: ID!
    title: String
    content: String!
    imageUrl: String
    author: User!
    dislikes: [Dislike]
    TotalDislikes: Int
    comments: [Comment]
    TotalComments: Int
    createdAt: String!
    updatedAt: String
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    dislikes: [Dislike]
    TotalDislikes: Int
    createdAt: String
    updatedAt: String
    parent: Comment
    replies: [Comment]
    isReply: Boolean
  }

  type CommentUpdateResponse {
    code: Int!
    success: Boolean!
    message: String!
  }

  type RequestPasswordResetResponse {
    code: Int!
    success: Boolean!
    message: String!
  }

  type ResetPasswordWithTokenResponse {
    code: Int!
    success: Boolean!
    message: String!
  }
`;
