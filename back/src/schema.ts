import gql from "graphql-tag";

export const typeDefs = gql`
    type Query {
        findUserById(id : String!) : User
    }

    type Mutation {
        createUser(username: String!, password: String!): CreateUserResponse!
        signIn(username: String!, password: String!): SignInResponse!
    }
    
    type CreateUserResponse {
        code: Int!
        success: Boolean!
        message: String!
        user: User
    }
    type SignInResponse {
        code: Int!
        success: Boolean!
        message: String!
        token: String
    }

    type User {
        id : ID!
        username : String!
        articles : [Article]
        comments : [Comment]
        likes : [Like]
        bio : String
        createdAt : String!
    }

    type Like{
        id : ID!
        user : User!
        article : Article
        comment : Comment
    }

    type Article {  
        id : ID!
        title : String!
        content : String!
        author : User!
        likes : [Like]
        comments : [Comment]
    }

    type Comment {
        id : ID!
        content : String!
        author : User!
        likes : [Like]
    }
`;

