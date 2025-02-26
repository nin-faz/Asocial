import { userMutations } from "./domain/user/mutation.js";
import { Resolvers } from "./types.js";

export const resolvers = {
    Mutation: {
        ...userMutations
    },
}