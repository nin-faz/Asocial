/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateArticle($title: String, $content: String!, $imageUrl: String) {\n    createArticle(title: $title, content: $content, imageUrl: $imageUrl) {\n      code\n      success\n      message\n      article {\n        id\n        title\n        content\n        createdAt\n        updatedAt\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n": typeof types.CreateArticleDocument,
    "\n  mutation UpdateArticle(\n    $id: ID!\n    $title: String\n    $content: String\n    $imageUrl: String\n  ) {\n    updateArticle(\n      id: $id\n      title: $title\n      content: $content\n      imageUrl: $imageUrl\n    ) {\n      code\n      success\n      message\n    }\n  }\n": typeof types.UpdateArticleDocument,
    "\n  mutation deleteArticle($id: ID!) {\n    deleteArticle(id: $id) {\n      code\n      success\n      message\n    }\n  }\n": typeof types.DeleteArticleDocument,
    "\n  mutation AddComment(\n    $content: String!\n    $userId: ID!\n    $articleId: ID!\n    $parentId: ID\n  ) {\n    addComment(\n      content: $content\n      userId: $userId\n      articleId: $articleId\n      parentId: $parentId\n    ) {\n      id\n      content\n      author {\n        id\n        username\n      }\n    }\n  }\n": typeof types.AddCommentDocument,
    "\n  mutation DeleteComment($commentId: ID!) {\n    deleteComment(commentId: $commentId) {\n      code\n      success\n      message\n    }\n  }\n": typeof types.DeleteCommentDocument,
    "\n  mutation UpdateComment($commentId: ID!, $content: String!) {\n    updateComment(commentId: $commentId, content: $content) {\n      code\n      success\n      message\n    }\n  }\n": typeof types.UpdateCommentDocument,
    "\n  mutation AddArticleDislike($articleId: ID!, $userId: ID!) {\n    addArticleDislike(articleId: $articleId, userId: $userId) {\n      id\n      article {\n        id\n      }\n      user {\n        id\n        username\n      }\n    }\n  }\n": typeof types.AddArticleDislikeDocument,
    "\n  mutation DeleteArticleDislike($articleId: ID!, $userId: ID!) {\n    deleteArticleDislike(articleId: $articleId, userId: $userId) {\n      code\n      success\n      message\n    }\n  }\n": typeof types.DeleteArticleDislikeDocument,
    "\n  mutation AddCommentDislike($commentId: ID!, $userId: ID!) {\n    addCommentDislike(commentId: $commentId, userId: $userId) {\n      id\n    }\n  }\n": typeof types.AddCommentDislikeDocument,
    "\n  mutation DeleteCommentDislike($commentId: ID!, $userId: ID!) {\n    deleteCommentDislike(commentId: $commentId, userId: $userId) {\n      code\n      success\n      message\n    }\n  }\n": typeof types.DeleteCommentDislikeDocument,
    "\n  mutation MarkNotificationsAsRead($ids: [ID!]!) {\n    markNotificationsAsRead(ids: $ids) {\n      code\n      success\n      message\n      notifications {\n        id\n        type\n        message\n        isRead\n        createdAt\n        articleId\n        commentId\n      }\n    }\n  }\n": typeof types.MarkNotificationsAsReadDocument,
    "\n  mutation RequestPasswordReset($email: String!, $username: String!) {\n    requestPasswordReset(email: $email, username: $username) {\n      code\n      success\n      message\n    }\n  }\n": typeof types.RequestPasswordResetDocument,
    "\n  mutation ResetPasswordWithToken(\n    $token: String!\n    $username: String!\n    $newPassword: String!\n  ) {\n    resetPasswordWithToken(\n      token: $token\n      username: $username\n      newPassword: $newPassword\n    ) {\n      code\n      success\n      message\n    }\n  }\n": typeof types.ResetPasswordWithTokenDocument,
    "\n  mutation CreateUser($username: String!, $password: String!) {\n    createUser(username: $username, password: $password) {\n      success\n      message\n      user {\n        username\n      }\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  mutation SignIn($username: String!, $password: String!) {\n    signIn(username: $username, password: $password) {\n      success\n      message\n      token\n    }\n  }\n": typeof types.SignInDocument,
    "\n  mutation UpdateUser($id: ID!, $body: userUpdateBody!) {\n    updateUser(id: $id, body: $body) {\n      success\n      message\n      user {\n        id\n        username\n        bio\n        iconName\n        createdAt\n      }\n    }\n  }\n": typeof types.UpdateUserDocument,
    "\n  query FindArticles {\n    findArticles {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n": typeof types.FindArticlesDocument,
    "\n  query FindArticleById($id: ID!) {\n    findArticleById(id: $id) {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n": typeof types.FindArticleByIdDocument,
    "\n  query FindArticleByMostDisliked {\n    findArticleByMostDisliked {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n      }\n    }\n  }\n": typeof types.FindArticleByMostDislikedDocument,
    "\n  query FindArticlesByUser($userId: ID!) {\n    findArticlesByUser(userId: $userId) {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n": typeof types.FindArticlesByUserDocument,
    "\n  query GetComments($articleId: ID!) {\n    getComments(articleId: $articleId) {\n      id\n      content\n      isReply\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      dislikes {\n        user {\n          id\n        }\n      }\n      TotalDislikes\n      parent {\n        id\n        content\n        author {\n          username\n        }\n      }\n      replies {\n        id\n        content\n        author {\n          id\n          username\n          iconName\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": typeof types.GetCommentsDocument,
    "\n  query FindDislikesByUserIdForArticles($userId: ID!) {\n    getDislikesByUserIdForArticles(userId: $userId) {\n      user {\n        id\n        username\n      }\n      article {\n        id\n        title\n        content\n        imageUrl\n        createdAt\n        updatedAt\n        author {\n          username\n          id\n          iconName\n        }\n      }\n    }\n  }\n": typeof types.FindDislikesByUserIdForArticlesDocument,
    "\n  query FindDislikesByUserIdForComments($userId: ID!) {\n    getDislikesByUserIdForComments(userId: $userId) {\n      user {\n        id\n        username\n      }\n      comment {\n        id\n        content\n        createdAt\n        author {\n          username\n          id\n        }\n      }\n    }\n  }\n": typeof types.FindDislikesByUserIdForCommentsDocument,
    "\n  query GetNotifications($userId: ID!, $limit: Int, $offset: Int) {\n    getNotifications(userId: $userId, limit: $limit, offset: $offset) {\n      id\n      type\n      message\n      isRead\n      createdAt\n      articleId\n      commentId\n    }\n  }\n": typeof types.GetNotificationsDocument,
    "\n  query GetUserbyToken($token: String!) {\n    getUserbyToken(token: $token) {\n      id\n      username\n    }\n  }\n": typeof types.GetUserbyTokenDocument,
    "\n  query GetUserById($id: ID!) {\n    findUserById(id: $id) {\n      id\n      username\n      bio\n      iconName\n      createdAt\n      TotalDislikes\n      TotalComments\n    }\n  }\n": typeof types.GetUserByIdDocument,
};
const documents: Documents = {
    "\n  mutation CreateArticle($title: String, $content: String!, $imageUrl: String) {\n    createArticle(title: $title, content: $content, imageUrl: $imageUrl) {\n      code\n      success\n      message\n      article {\n        id\n        title\n        content\n        createdAt\n        updatedAt\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n": types.CreateArticleDocument,
    "\n  mutation UpdateArticle(\n    $id: ID!\n    $title: String\n    $content: String\n    $imageUrl: String\n  ) {\n    updateArticle(\n      id: $id\n      title: $title\n      content: $content\n      imageUrl: $imageUrl\n    ) {\n      code\n      success\n      message\n    }\n  }\n": types.UpdateArticleDocument,
    "\n  mutation deleteArticle($id: ID!) {\n    deleteArticle(id: $id) {\n      code\n      success\n      message\n    }\n  }\n": types.DeleteArticleDocument,
    "\n  mutation AddComment(\n    $content: String!\n    $userId: ID!\n    $articleId: ID!\n    $parentId: ID\n  ) {\n    addComment(\n      content: $content\n      userId: $userId\n      articleId: $articleId\n      parentId: $parentId\n    ) {\n      id\n      content\n      author {\n        id\n        username\n      }\n    }\n  }\n": types.AddCommentDocument,
    "\n  mutation DeleteComment($commentId: ID!) {\n    deleteComment(commentId: $commentId) {\n      code\n      success\n      message\n    }\n  }\n": types.DeleteCommentDocument,
    "\n  mutation UpdateComment($commentId: ID!, $content: String!) {\n    updateComment(commentId: $commentId, content: $content) {\n      code\n      success\n      message\n    }\n  }\n": types.UpdateCommentDocument,
    "\n  mutation AddArticleDislike($articleId: ID!, $userId: ID!) {\n    addArticleDislike(articleId: $articleId, userId: $userId) {\n      id\n      article {\n        id\n      }\n      user {\n        id\n        username\n      }\n    }\n  }\n": types.AddArticleDislikeDocument,
    "\n  mutation DeleteArticleDislike($articleId: ID!, $userId: ID!) {\n    deleteArticleDislike(articleId: $articleId, userId: $userId) {\n      code\n      success\n      message\n    }\n  }\n": types.DeleteArticleDislikeDocument,
    "\n  mutation AddCommentDislike($commentId: ID!, $userId: ID!) {\n    addCommentDislike(commentId: $commentId, userId: $userId) {\n      id\n    }\n  }\n": types.AddCommentDislikeDocument,
    "\n  mutation DeleteCommentDislike($commentId: ID!, $userId: ID!) {\n    deleteCommentDislike(commentId: $commentId, userId: $userId) {\n      code\n      success\n      message\n    }\n  }\n": types.DeleteCommentDislikeDocument,
    "\n  mutation MarkNotificationsAsRead($ids: [ID!]!) {\n    markNotificationsAsRead(ids: $ids) {\n      code\n      success\n      message\n      notifications {\n        id\n        type\n        message\n        isRead\n        createdAt\n        articleId\n        commentId\n      }\n    }\n  }\n": types.MarkNotificationsAsReadDocument,
    "\n  mutation RequestPasswordReset($email: String!, $username: String!) {\n    requestPasswordReset(email: $email, username: $username) {\n      code\n      success\n      message\n    }\n  }\n": types.RequestPasswordResetDocument,
    "\n  mutation ResetPasswordWithToken(\n    $token: String!\n    $username: String!\n    $newPassword: String!\n  ) {\n    resetPasswordWithToken(\n      token: $token\n      username: $username\n      newPassword: $newPassword\n    ) {\n      code\n      success\n      message\n    }\n  }\n": types.ResetPasswordWithTokenDocument,
    "\n  mutation CreateUser($username: String!, $password: String!) {\n    createUser(username: $username, password: $password) {\n      success\n      message\n      user {\n        username\n      }\n    }\n  }\n": types.CreateUserDocument,
    "\n  mutation SignIn($username: String!, $password: String!) {\n    signIn(username: $username, password: $password) {\n      success\n      message\n      token\n    }\n  }\n": types.SignInDocument,
    "\n  mutation UpdateUser($id: ID!, $body: userUpdateBody!) {\n    updateUser(id: $id, body: $body) {\n      success\n      message\n      user {\n        id\n        username\n        bio\n        iconName\n        createdAt\n      }\n    }\n  }\n": types.UpdateUserDocument,
    "\n  query FindArticles {\n    findArticles {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n": types.FindArticlesDocument,
    "\n  query FindArticleById($id: ID!) {\n    findArticleById(id: $id) {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n": types.FindArticleByIdDocument,
    "\n  query FindArticleByMostDisliked {\n    findArticleByMostDisliked {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n      }\n    }\n  }\n": types.FindArticleByMostDislikedDocument,
    "\n  query FindArticlesByUser($userId: ID!) {\n    findArticlesByUser(userId: $userId) {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n": types.FindArticlesByUserDocument,
    "\n  query GetComments($articleId: ID!) {\n    getComments(articleId: $articleId) {\n      id\n      content\n      isReply\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      dislikes {\n        user {\n          id\n        }\n      }\n      TotalDislikes\n      parent {\n        id\n        content\n        author {\n          username\n        }\n      }\n      replies {\n        id\n        content\n        author {\n          id\n          username\n          iconName\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n": types.GetCommentsDocument,
    "\n  query FindDislikesByUserIdForArticles($userId: ID!) {\n    getDislikesByUserIdForArticles(userId: $userId) {\n      user {\n        id\n        username\n      }\n      article {\n        id\n        title\n        content\n        imageUrl\n        createdAt\n        updatedAt\n        author {\n          username\n          id\n          iconName\n        }\n      }\n    }\n  }\n": types.FindDislikesByUserIdForArticlesDocument,
    "\n  query FindDislikesByUserIdForComments($userId: ID!) {\n    getDislikesByUserIdForComments(userId: $userId) {\n      user {\n        id\n        username\n      }\n      comment {\n        id\n        content\n        createdAt\n        author {\n          username\n          id\n        }\n      }\n    }\n  }\n": types.FindDislikesByUserIdForCommentsDocument,
    "\n  query GetNotifications($userId: ID!, $limit: Int, $offset: Int) {\n    getNotifications(userId: $userId, limit: $limit, offset: $offset) {\n      id\n      type\n      message\n      isRead\n      createdAt\n      articleId\n      commentId\n    }\n  }\n": types.GetNotificationsDocument,
    "\n  query GetUserbyToken($token: String!) {\n    getUserbyToken(token: $token) {\n      id\n      username\n    }\n  }\n": types.GetUserbyTokenDocument,
    "\n  query GetUserById($id: ID!) {\n    findUserById(id: $id) {\n      id\n      username\n      bio\n      iconName\n      createdAt\n      TotalDislikes\n      TotalComments\n    }\n  }\n": types.GetUserByIdDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateArticle($title: String, $content: String!, $imageUrl: String) {\n    createArticle(title: $title, content: $content, imageUrl: $imageUrl) {\n      code\n      success\n      message\n      article {\n        id\n        title\n        content\n        createdAt\n        updatedAt\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateArticle($title: String, $content: String!, $imageUrl: String) {\n    createArticle(title: $title, content: $content, imageUrl: $imageUrl) {\n      code\n      success\n      message\n      article {\n        id\n        title\n        content\n        createdAt\n        updatedAt\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateArticle(\n    $id: ID!\n    $title: String\n    $content: String\n    $imageUrl: String\n  ) {\n    updateArticle(\n      id: $id\n      title: $title\n      content: $content\n      imageUrl: $imageUrl\n    ) {\n      code\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateArticle(\n    $id: ID!\n    $title: String\n    $content: String\n    $imageUrl: String\n  ) {\n    updateArticle(\n      id: $id\n      title: $title\n      content: $content\n      imageUrl: $imageUrl\n    ) {\n      code\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deleteArticle($id: ID!) {\n    deleteArticle(id: $id) {\n      code\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation deleteArticle($id: ID!) {\n    deleteArticle(id: $id) {\n      code\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddComment(\n    $content: String!\n    $userId: ID!\n    $articleId: ID!\n    $parentId: ID\n  ) {\n    addComment(\n      content: $content\n      userId: $userId\n      articleId: $articleId\n      parentId: $parentId\n    ) {\n      id\n      content\n      author {\n        id\n        username\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddComment(\n    $content: String!\n    $userId: ID!\n    $articleId: ID!\n    $parentId: ID\n  ) {\n    addComment(\n      content: $content\n      userId: $userId\n      articleId: $articleId\n      parentId: $parentId\n    ) {\n      id\n      content\n      author {\n        id\n        username\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteComment($commentId: ID!) {\n    deleteComment(commentId: $commentId) {\n      code\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteComment($commentId: ID!) {\n    deleteComment(commentId: $commentId) {\n      code\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateComment($commentId: ID!, $content: String!) {\n    updateComment(commentId: $commentId, content: $content) {\n      code\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateComment($commentId: ID!, $content: String!) {\n    updateComment(commentId: $commentId, content: $content) {\n      code\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddArticleDislike($articleId: ID!, $userId: ID!) {\n    addArticleDislike(articleId: $articleId, userId: $userId) {\n      id\n      article {\n        id\n      }\n      user {\n        id\n        username\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddArticleDislike($articleId: ID!, $userId: ID!) {\n    addArticleDislike(articleId: $articleId, userId: $userId) {\n      id\n      article {\n        id\n      }\n      user {\n        id\n        username\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteArticleDislike($articleId: ID!, $userId: ID!) {\n    deleteArticleDislike(articleId: $articleId, userId: $userId) {\n      code\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteArticleDislike($articleId: ID!, $userId: ID!) {\n    deleteArticleDislike(articleId: $articleId, userId: $userId) {\n      code\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddCommentDislike($commentId: ID!, $userId: ID!) {\n    addCommentDislike(commentId: $commentId, userId: $userId) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation AddCommentDislike($commentId: ID!, $userId: ID!) {\n    addCommentDislike(commentId: $commentId, userId: $userId) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteCommentDislike($commentId: ID!, $userId: ID!) {\n    deleteCommentDislike(commentId: $commentId, userId: $userId) {\n      code\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteCommentDislike($commentId: ID!, $userId: ID!) {\n    deleteCommentDislike(commentId: $commentId, userId: $userId) {\n      code\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkNotificationsAsRead($ids: [ID!]!) {\n    markNotificationsAsRead(ids: $ids) {\n      code\n      success\n      message\n      notifications {\n        id\n        type\n        message\n        isRead\n        createdAt\n        articleId\n        commentId\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation MarkNotificationsAsRead($ids: [ID!]!) {\n    markNotificationsAsRead(ids: $ids) {\n      code\n      success\n      message\n      notifications {\n        id\n        type\n        message\n        isRead\n        createdAt\n        articleId\n        commentId\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RequestPasswordReset($email: String!, $username: String!) {\n    requestPasswordReset(email: $email, username: $username) {\n      code\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation RequestPasswordReset($email: String!, $username: String!) {\n    requestPasswordReset(email: $email, username: $username) {\n      code\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetPasswordWithToken(\n    $token: String!\n    $username: String!\n    $newPassword: String!\n  ) {\n    resetPasswordWithToken(\n      token: $token\n      username: $username\n      newPassword: $newPassword\n    ) {\n      code\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ResetPasswordWithToken(\n    $token: String!\n    $username: String!\n    $newPassword: String!\n  ) {\n    resetPasswordWithToken(\n      token: $token\n      username: $username\n      newPassword: $newPassword\n    ) {\n      code\n      success\n      message\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateUser($username: String!, $password: String!) {\n    createUser(username: $username, password: $password) {\n      success\n      message\n      user {\n        username\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUser($username: String!, $password: String!) {\n    createUser(username: $username, password: $password) {\n      success\n      message\n      user {\n        username\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SignIn($username: String!, $password: String!) {\n    signIn(username: $username, password: $password) {\n      success\n      message\n      token\n    }\n  }\n"): (typeof documents)["\n  mutation SignIn($username: String!, $password: String!) {\n    signIn(username: $username, password: $password) {\n      success\n      message\n      token\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUser($id: ID!, $body: userUpdateBody!) {\n    updateUser(id: $id, body: $body) {\n      success\n      message\n      user {\n        id\n        username\n        bio\n        iconName\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUser($id: ID!, $body: userUpdateBody!) {\n    updateUser(id: $id, body: $body) {\n      success\n      message\n      user {\n        id\n        username\n        bio\n        iconName\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindArticles {\n    findArticles {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FindArticles {\n    findArticles {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindArticleById($id: ID!) {\n    findArticleById(id: $id) {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FindArticleById($id: ID!) {\n    findArticleById(id: $id) {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindArticleByMostDisliked {\n    findArticleByMostDisliked {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query FindArticleByMostDisliked {\n    findArticleByMostDisliked {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindArticlesByUser($userId: ID!) {\n    findArticlesByUser(userId: $userId) {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FindArticlesByUser($userId: ID!) {\n    findArticlesByUser(userId: $userId) {\n      id\n      title\n      content\n      imageUrl\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      TotalDislikes\n      TotalComments\n      dislikes {\n        id\n        user {\n          id\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetComments($articleId: ID!) {\n    getComments(articleId: $articleId) {\n      id\n      content\n      isReply\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      dislikes {\n        user {\n          id\n        }\n      }\n      TotalDislikes\n      parent {\n        id\n        content\n        author {\n          username\n        }\n      }\n      replies {\n        id\n        content\n        author {\n          id\n          username\n          iconName\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetComments($articleId: ID!) {\n    getComments(articleId: $articleId) {\n      id\n      content\n      isReply\n      author {\n        id\n        username\n        iconName\n      }\n      createdAt\n      updatedAt\n      dislikes {\n        user {\n          id\n        }\n      }\n      TotalDislikes\n      parent {\n        id\n        content\n        author {\n          username\n        }\n      }\n      replies {\n        id\n        content\n        author {\n          id\n          username\n          iconName\n        }\n        createdAt\n        updatedAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindDislikesByUserIdForArticles($userId: ID!) {\n    getDislikesByUserIdForArticles(userId: $userId) {\n      user {\n        id\n        username\n      }\n      article {\n        id\n        title\n        content\n        imageUrl\n        createdAt\n        updatedAt\n        author {\n          username\n          id\n          iconName\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FindDislikesByUserIdForArticles($userId: ID!) {\n    getDislikesByUserIdForArticles(userId: $userId) {\n      user {\n        id\n        username\n      }\n      article {\n        id\n        title\n        content\n        imageUrl\n        createdAt\n        updatedAt\n        author {\n          username\n          id\n          iconName\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query FindDislikesByUserIdForComments($userId: ID!) {\n    getDislikesByUserIdForComments(userId: $userId) {\n      user {\n        id\n        username\n      }\n      comment {\n        id\n        content\n        createdAt\n        author {\n          username\n          id\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query FindDislikesByUserIdForComments($userId: ID!) {\n    getDislikesByUserIdForComments(userId: $userId) {\n      user {\n        id\n        username\n      }\n      comment {\n        id\n        content\n        createdAt\n        author {\n          username\n          id\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetNotifications($userId: ID!, $limit: Int, $offset: Int) {\n    getNotifications(userId: $userId, limit: $limit, offset: $offset) {\n      id\n      type\n      message\n      isRead\n      createdAt\n      articleId\n      commentId\n    }\n  }\n"): (typeof documents)["\n  query GetNotifications($userId: ID!, $limit: Int, $offset: Int) {\n    getNotifications(userId: $userId, limit: $limit, offset: $offset) {\n      id\n      type\n      message\n      isRead\n      createdAt\n      articleId\n      commentId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserbyToken($token: String!) {\n    getUserbyToken(token: $token) {\n      id\n      username\n    }\n  }\n"): (typeof documents)["\n  query GetUserbyToken($token: String!) {\n    getUserbyToken(token: $token) {\n      id\n      username\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserById($id: ID!) {\n    findUserById(id: $id) {\n      id\n      username\n      bio\n      iconName\n      createdAt\n      TotalDislikes\n      TotalComments\n    }\n  }\n"): (typeof documents)["\n  query GetUserById($id: ID!) {\n    findUserById(id: $id) {\n      id\n      username\n      bio\n      iconName\n      createdAt\n      TotalDislikes\n      TotalComments\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;