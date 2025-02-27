import { MutationResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";
import { createUser } from "./createUser.js";
import { signIn } from "./signIn.js";
import { updateUser } from "./updateUser.js";

type UserMutations = WithRequired<MutationResolvers, 'createUser' | 'signIn'>

export const userMutations: UserMutations = {
  createUser,
  signIn, 
  updateUser
}