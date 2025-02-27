/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Article = {
  __typename?: 'Article';
  author: User;
  comments: Maybe<Array<Maybe<Comment>>>;
  content: Scalars['String']['output'];
  createdAt: Maybe<Scalars['String']['output']>;
  dislikes: Maybe<Array<Maybe<Dislike>>>;
  id: Scalars['ID']['output'];
  title: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['String']['output']>;
};

export type Comment = {
  __typename?: 'Comment';
  author: User;
  content: Scalars['String']['output'];
  dislikes: Maybe<Array<Maybe<Dislike>>>;
  id: Scalars['ID']['output'];
};

export type CreateArticleResponse = {
  __typename?: 'CreateArticleResponse';
  article: Maybe<Article>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CreateUserResponse = {
  __typename?: 'CreateUserResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user: Maybe<UserSummary>;
};

export type DeleteArticleResponse = {
  __typename?: 'DeleteArticleResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteCommentResponse = {
  __typename?: 'DeleteCommentResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteDislikeResponse = {
  __typename?: 'DeleteDislikeResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Dislike = {
  __typename?: 'Dislike';
  article: Maybe<Article>;
  comment: Maybe<Comment>;
  id: Scalars['ID']['output'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  addArticleDislike: Maybe<Dislike>;
  addComment: Maybe<Comment>;
  addCommentDislike: Maybe<Dislike>;
  createArticle: CreateArticleResponse;
  createUser: CreateUserResponse;
  deleteArticle: DeleteArticleResponse;
  deleteArticleDislike: Maybe<DeleteDislikeResponse>;
  deleteComment: Maybe<DeleteCommentResponse>;
  deleteCommentDislike: Maybe<DeleteDislikeResponse>;
  signIn: SignInResponse;
  updateArticle: UpdateArticleResponse;
  updateComment: Maybe<Comment>;
  updateUser: UpdateUserResponse;
};


export type MutationAddArticleDislikeArgs = {
  articleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationAddCommentArgs = {
  articleId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationAddCommentDislikeArgs = {
  commentId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationCreateArticleArgs = {
  content: Scalars['String']['input'];
  title: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateUserArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationDeleteArticleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteArticleDislikeArgs = {
  articleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationDeleteCommentArgs = {
  commentId: Scalars['ID']['input'];
};


export type MutationDeleteCommentDislikeArgs = {
  commentId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationSignInArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationUpdateArticleArgs = {
  content: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  title: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCommentArgs = {
  commentId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  body: UserUpdateBody;
  id: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  findArticleById: Maybe<Article>;
  findArticleByMostDisliked: Maybe<Array<Maybe<Article>>>;
  findArticles: Maybe<Array<Maybe<Article>>>;
  findUserById: Maybe<UserSummary>;
  getComments: Maybe<Array<Maybe<Comment>>>;
};


export type QueryFindArticleByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFindUserByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetCommentsArgs = {
  articleId: Scalars['ID']['input'];
};

export type SignInResponse = {
  __typename?: 'SignInResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  token: Maybe<Scalars['String']['output']>;
};

export type UpdateArticleResponse = {
  __typename?: 'UpdateArticleResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type User = {
  __typename?: 'User';
  articles: Maybe<Array<Maybe<Article>>>;
  bio: Maybe<Scalars['String']['output']>;
  comments: Maybe<Array<Maybe<Comment>>>;
  createdAt: Maybe<Scalars['String']['output']>;
  dislikes: Maybe<Array<Maybe<Dislike>>>;
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

export type UserSummary = {
  __typename?: 'UserSummary';
  bio: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

export type UpdateUserResponse = {
  __typename?: 'updateUserResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user: Maybe<UserSummary>;
};

export type UserUpdateBody = {
  bio: InputMaybe<Scalars['String']['input']>;
  password: InputMaybe<Scalars['String']['input']>;
  username: InputMaybe<Scalars['String']['input']>;
};
