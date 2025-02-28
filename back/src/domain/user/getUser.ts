import { getUser } from "../../module/auth.js";
import { QueryResolvers } from "../../types";

export const getUserByToken: NonNullable<QueryResolvers['getUserbyToken']> = async (_, {token}) => getUser(token);