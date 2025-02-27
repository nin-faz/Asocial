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
  dislikes: Maybe<Array<Maybe<Dislike>>>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type Comment = {
  __typename?: 'Comment';
  author: User;
  content: Scalars['String']['output'];
  dislikes: Maybe<Array<Maybe<Dislike>>>;
  id: Scalars['ID']['output'];
};

export type CreateUserResponse = {
  __typename?: 'CreateUserResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user: Maybe<User>;
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
  createUser: CreateUserResponse;
  signIn: SignInResponse;
};


export type MutationCreateUserArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationSignInArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  findUserById: Maybe<User>;
};


export type QueryFindUserByIdArgs = {
  id: Scalars['ID']['input'];
};

export type SignInResponse = {
  __typename?: 'SignInResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  token: Maybe<Scalars['String']['output']>;
};

export type User = {
  __typename?: 'User';
  articles: Maybe<Array<Maybe<Article>>>;
  bio: Maybe<Scalars['String']['output']>;
  comments: Maybe<Array<Maybe<Comment>>>;
  createdAt: Scalars['String']['output'];
  dislikes: Maybe<Array<Maybe<Dislike>>>;
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};
