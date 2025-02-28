import { dislikeMutations } from "./domain/dislike/mutation.js";
import { userMutations } from "./domain/user/mutation.js";
import { articleMutations } from "./domain/article/mutation.js";
import { userQueries } from "./domain/user/queries.js";
import { Resolvers } from "./types.js";
import { articleQueries } from "./domain/article/queries.js";
import { commentQueries } from "./domain/comment/queries.js";
import { commentMutations } from "./domain/comment/mutation.js";
import { dislikeQueries } from "./domain/dislike/queries.js";

export const resolvers: Resolvers = {
    Query: {
        ...userQueries,
        ...articleQueries, 
        ...commentQueries,
        ...dislikeQueries   
    },
    Mutation: {
        ...userMutations,
        ...dislikeMutations,
        ...articleMutations,
        ...commentMutations
    },

    Article: {
        comments: (parent, _, { dataSources: { db } }) => {
          return db.comment.findMany({
            where: { articleId: parent.id },
            include: {
              author: true,
              dislikes: true
            }
          });
        },
        dislikes: (parent, _, { dataSources: { db } }) => {
          return db.dislike.findMany({
            where: { articleId: parent.id }
          });
        },
    },
    Comment: {
        dislikes: (parent, _, { dataSources: { db } }) => {
          return db.dislike.findMany({
            where: { commentId: parent.id }
          });
        }, 
    },
    Dislike: {
        article: (parent, _, { dataSources: { db } }) => {
            console.log("parent", parent);
            if(!parent.articleId) return null;
            return db.article.findUnique({
                where: { id: parent.articleId },
                include: {
                  author: true
                }
            });
        },
        comment: (parent, _, { dataSources: { db } }) => {
            if(!parent.commentId) return null;
            return db.comment.findUnique({
                where: { id: parent.commentId }
            });
        },
    }
    
    
}