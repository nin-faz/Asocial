import gql from "graphql-tag";

export const typeDefs = gql`
    type Query {
        findUserById(id : ID!) : User
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
        dislikes : [Dislike]
        bio : String
        createdAt : String!
    }

    type Dislike{
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
        dislikes : [Dislike]
        comments : [Comment]
    }

    type Comment {
        id : ID!
        content : String!
        author : User!
        dislikes : [Dislike]
    }
`;

