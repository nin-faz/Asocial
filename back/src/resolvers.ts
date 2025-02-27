import { dislikeMutations } from "./domain/dislike/mutation.js";
import { userMutations } from "./domain/user/mutation.js";
import { articleMutations } from "./domain/article/mutation.js";
import { userQueries } from "./domain/user/queries.js";
import { Resolvers } from "./types.js";
import { articleQueries } from "./domain/article/queries.js";

export const resolvers: Resolvers = {
    Query: {
        ...userQueries,
        ...articleQueries
        
    },
    Mutation: {
        ...userMutations,
        ...dislikeMutations,
        ...articleMutations
    },
}