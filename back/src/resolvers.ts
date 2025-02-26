import { userMutations } from "./domain/user/mutation.js";
import { userQueries } from "./domain/user/queries.js";
import { Resolvers } from "./types.js";

export const resolvers : Resolvers = {
    Query: {
        ...userQueries
    },
    Mutation: {
        ...userMutations
    },
}