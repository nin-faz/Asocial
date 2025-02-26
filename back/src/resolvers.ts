import { userMutations } from "./domain/user/mutation.js";
import { userQueries } from "./domain/user/UserQueries.js";
import { Resolvers } from "./types.js";

export const resolvers = {
    Query: {
        ...userQueries
    },
    Mutation: {
        ...userMutations
    },
}