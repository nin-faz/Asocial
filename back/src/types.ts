import { GraphQLResolveInfo } from 'graphql';
import { UserModel, ArticleModel, DislikeModel, CommentModel } from './model';
import { Context } from './context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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
  TotalComments?: Maybe<Scalars['Int']['output']>;
  TotalDislikes?: Maybe<Scalars['Int']['output']>;
  author: User;
  comments?: Maybe<Array<Maybe<Comment>>>;
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  dislikes?: Maybe<Array<Maybe<Dislike>>>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type Comment = {
  __typename?: 'Comment';
  TotalDislikes?: Maybe<Scalars['Int']['output']>;
  author: User;
  content: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  dislikes?: Maybe<Array<Maybe<Dislike>>>;
  id: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type CommentUpdateResponse = {
  __typename?: 'CommentUpdateResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CreateArticleResponse = {
  __typename?: 'CreateArticleResponse';
  article?: Maybe<Article>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CreateUserResponse = {
  __typename?: 'CreateUserResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<UserSummary>;
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
  article?: Maybe<Article>;
  comment?: Maybe<Comment>;
  id: Scalars['ID']['output'];
  user?: Maybe<User>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addArticleDislike?: Maybe<Dislike>;
  addComment?: Maybe<Comment>;
  addCommentDislike?: Maybe<Dislike>;
  createArticle: CreateArticleResponse;
  createUser: CreateUserResponse;
  deleteArticle: DeleteArticleResponse;
  deleteArticleDislike?: Maybe<DeleteDislikeResponse>;
  deleteComment?: Maybe<DeleteCommentResponse>;
  deleteCommentDislike?: Maybe<DeleteDislikeResponse>;
  signIn: SignInResponse;
  updateArticle: UpdateArticleResponse;
  updateComment?: Maybe<CommentUpdateResponse>;
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
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
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
  content?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
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
  findArticleById?: Maybe<Article>;
  findArticleByMostDisliked?: Maybe<Array<Maybe<Article>>>;
  findArticles?: Maybe<Array<Maybe<Article>>>;
  findArticlesByUser: Array<Article>;
  findUserById?: Maybe<UserSummary>;
  getComments?: Maybe<Array<Maybe<Comment>>>;
  getDislikesByArticleId?: Maybe<Array<Maybe<Dislike>>>;
  getDislikesByCommentId?: Maybe<Array<Maybe<Dislike>>>;
  getDislikesByUserIdForArticles?: Maybe<Array<Maybe<Dislike>>>;
  getDislikesByUserIdForComments?: Maybe<Array<Maybe<Dislike>>>;
  getUserbyToken?: Maybe<UserToken>;
};


export type QueryFindArticleByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFindArticlesByUserArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryFindUserByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetCommentsArgs = {
  articleId: Scalars['ID']['input'];
};


export type QueryGetDislikesByArticleIdArgs = {
  articleId: Scalars['ID']['input'];
};


export type QueryGetDislikesByCommentIdArgs = {
  commentId: Scalars['ID']['input'];
};


export type QueryGetDislikesByUserIdForArticlesArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryGetDislikesByUserIdForCommentsArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryGetUserbyTokenArgs = {
  token: Scalars['String']['input'];
};

export type SignInResponse = {
  __typename?: 'SignInResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
};

export type UpdateArticleResponse = {
  __typename?: 'UpdateArticleResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type User = {
  __typename?: 'User';
  articles?: Maybe<Array<Maybe<Article>>>;
  bio?: Maybe<Scalars['String']['output']>;
  comments?: Maybe<Array<Maybe<Comment>>>;
  createdAt: Scalars['String']['output'];
  dislikes?: Maybe<Array<Maybe<Dislike>>>;
  iconName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

export type UserSummary = {
  __typename?: 'UserSummary';
  TotalComments?: Maybe<Scalars['Int']['output']>;
  TotalDislikes?: Maybe<Scalars['Int']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  iconName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

export type UserToken = {
  __typename?: 'UserToken';
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

export type UpdateUserResponse = {
  __typename?: 'updateUserResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<UserSummary>;
};

export type UserUpdateBody = {
  bio?: InputMaybe<Scalars['String']['input']>;
  iconName?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Article: ResolverTypeWrapper<ArticleModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Comment: ResolverTypeWrapper<CommentModel>;
  CommentUpdateResponse: ResolverTypeWrapper<CommentUpdateResponse>;
  CreateArticleResponse: ResolverTypeWrapper<Omit<CreateArticleResponse, 'article'> & { article?: Maybe<ResolversTypes['Article']> }>;
  CreateUserResponse: ResolverTypeWrapper<CreateUserResponse>;
  DeleteArticleResponse: ResolverTypeWrapper<DeleteArticleResponse>;
  DeleteCommentResponse: ResolverTypeWrapper<DeleteCommentResponse>;
  DeleteDislikeResponse: ResolverTypeWrapper<DeleteDislikeResponse>;
  Dislike: ResolverTypeWrapper<DislikeModel>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  SignInResponse: ResolverTypeWrapper<SignInResponse>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UpdateArticleResponse: ResolverTypeWrapper<UpdateArticleResponse>;
  User: ResolverTypeWrapper<UserModel>;
  UserSummary: ResolverTypeWrapper<UserSummary>;
  UserToken: ResolverTypeWrapper<UserToken>;
  updateUserResponse: ResolverTypeWrapper<UpdateUserResponse>;
  userUpdateBody: UserUpdateBody;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Article: ArticleModel;
  Boolean: Scalars['Boolean']['output'];
  Comment: CommentModel;
  CommentUpdateResponse: CommentUpdateResponse;
  CreateArticleResponse: Omit<CreateArticleResponse, 'article'> & { article?: Maybe<ResolversParentTypes['Article']> };
  CreateUserResponse: CreateUserResponse;
  DeleteArticleResponse: DeleteArticleResponse;
  DeleteCommentResponse: DeleteCommentResponse;
  DeleteDislikeResponse: DeleteDislikeResponse;
  Dislike: DislikeModel;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Query: {};
  SignInResponse: SignInResponse;
  String: Scalars['String']['output'];
  UpdateArticleResponse: UpdateArticleResponse;
  User: UserModel;
  UserSummary: UserSummary;
  UserToken: UserToken;
  updateUserResponse: UpdateUserResponse;
  userUpdateBody: UserUpdateBody;
};

export type ArticleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Article'] = ResolversParentTypes['Article']> = {
  TotalComments?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  TotalDislikes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  comments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Comment']>>>, ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dislikes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dislike']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  TotalDislikes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dislikes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dislike']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentUpdateResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CommentUpdateResponse'] = ResolversParentTypes['CommentUpdateResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateArticleResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateArticleResponse'] = ResolversParentTypes['CreateArticleResponse']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateUserResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateUserResponse'] = ResolversParentTypes['CreateUserResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['UserSummary']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteArticleResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteArticleResponse'] = ResolversParentTypes['DeleteArticleResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteCommentResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteCommentResponse'] = ResolversParentTypes['DeleteCommentResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteDislikeResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteDislikeResponse'] = ResolversParentTypes['DeleteDislikeResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DislikeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Dislike'] = ResolversParentTypes['Dislike']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addArticleDislike?: Resolver<Maybe<ResolversTypes['Dislike']>, ParentType, ContextType, RequireFields<MutationAddArticleDislikeArgs, 'articleId' | 'userId'>>;
  addComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationAddCommentArgs, 'articleId' | 'content' | 'userId'>>;
  addCommentDislike?: Resolver<Maybe<ResolversTypes['Dislike']>, ParentType, ContextType, RequireFields<MutationAddCommentDislikeArgs, 'commentId' | 'userId'>>;
  createArticle?: Resolver<ResolversTypes['CreateArticleResponse'], ParentType, ContextType, RequireFields<MutationCreateArticleArgs, 'content'>>;
  createUser?: Resolver<ResolversTypes['CreateUserResponse'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'password' | 'username'>>;
  deleteArticle?: Resolver<ResolversTypes['DeleteArticleResponse'], ParentType, ContextType, RequireFields<MutationDeleteArticleArgs, 'id'>>;
  deleteArticleDislike?: Resolver<Maybe<ResolversTypes['DeleteDislikeResponse']>, ParentType, ContextType, RequireFields<MutationDeleteArticleDislikeArgs, 'articleId' | 'userId'>>;
  deleteComment?: Resolver<Maybe<ResolversTypes['DeleteCommentResponse']>, ParentType, ContextType, RequireFields<MutationDeleteCommentArgs, 'commentId'>>;
  deleteCommentDislike?: Resolver<Maybe<ResolversTypes['DeleteDislikeResponse']>, ParentType, ContextType, RequireFields<MutationDeleteCommentDislikeArgs, 'commentId' | 'userId'>>;
  signIn?: Resolver<ResolversTypes['SignInResponse'], ParentType, ContextType, RequireFields<MutationSignInArgs, 'password' | 'username'>>;
  updateArticle?: Resolver<ResolversTypes['UpdateArticleResponse'], ParentType, ContextType, RequireFields<MutationUpdateArticleArgs, 'id'>>;
  updateComment?: Resolver<Maybe<ResolversTypes['CommentUpdateResponse']>, ParentType, ContextType, RequireFields<MutationUpdateCommentArgs, 'commentId' | 'content'>>;
  updateUser?: Resolver<ResolversTypes['updateUserResponse'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'body' | 'id'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  findArticleById?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType, RequireFields<QueryFindArticleByIdArgs, 'id'>>;
  findArticleByMostDisliked?: Resolver<Maybe<Array<Maybe<ResolversTypes['Article']>>>, ParentType, ContextType>;
  findArticles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Article']>>>, ParentType, ContextType>;
  findArticlesByUser?: Resolver<Array<ResolversTypes['Article']>, ParentType, ContextType, RequireFields<QueryFindArticlesByUserArgs, 'userId'>>;
  findUserById?: Resolver<Maybe<ResolversTypes['UserSummary']>, ParentType, ContextType, RequireFields<QueryFindUserByIdArgs, 'id'>>;
  getComments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Comment']>>>, ParentType, ContextType, RequireFields<QueryGetCommentsArgs, 'articleId'>>;
  getDislikesByArticleId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dislike']>>>, ParentType, ContextType, RequireFields<QueryGetDislikesByArticleIdArgs, 'articleId'>>;
  getDislikesByCommentId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dislike']>>>, ParentType, ContextType, RequireFields<QueryGetDislikesByCommentIdArgs, 'commentId'>>;
  getDislikesByUserIdForArticles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dislike']>>>, ParentType, ContextType, RequireFields<QueryGetDislikesByUserIdForArticlesArgs, 'userId'>>;
  getDislikesByUserIdForComments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dislike']>>>, ParentType, ContextType, RequireFields<QueryGetDislikesByUserIdForCommentsArgs, 'userId'>>;
  getUserbyToken?: Resolver<Maybe<ResolversTypes['UserToken']>, ParentType, ContextType, RequireFields<QueryGetUserbyTokenArgs, 'token'>>;
};

export type SignInResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SignInResponse'] = ResolversParentTypes['SignInResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateArticleResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateArticleResponse'] = ResolversParentTypes['UpdateArticleResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  articles?: Resolver<Maybe<Array<Maybe<ResolversTypes['Article']>>>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Comment']>>>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dislikes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dislike']>>>, ParentType, ContextType>;
  iconName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSummaryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSummary'] = ResolversParentTypes['UserSummary']> = {
  TotalComments?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  TotalDislikes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  iconName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserTokenResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserToken'] = ResolversParentTypes['UserToken']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateUserResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['updateUserResponse'] = ResolversParentTypes['updateUserResponse']> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['UserSummary']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Article?: ArticleResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  CommentUpdateResponse?: CommentUpdateResponseResolvers<ContextType>;
  CreateArticleResponse?: CreateArticleResponseResolvers<ContextType>;
  CreateUserResponse?: CreateUserResponseResolvers<ContextType>;
  DeleteArticleResponse?: DeleteArticleResponseResolvers<ContextType>;
  DeleteCommentResponse?: DeleteCommentResponseResolvers<ContextType>;
  DeleteDislikeResponse?: DeleteDislikeResponseResolvers<ContextType>;
  Dislike?: DislikeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SignInResponse?: SignInResponseResolvers<ContextType>;
  UpdateArticleResponse?: UpdateArticleResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserSummary?: UserSummaryResolvers<ContextType>;
  UserToken?: UserTokenResolvers<ContextType>;
  updateUserResponse?: UpdateUserResponseResolvers<ContextType>;
};

