import { PrismaClient } from "@prisma/client";
import { AuthenticatedUser } from "../src/module/auth";

export type Context = {
  dataSources: {
    db: PrismaClient,
  };
  user: AuthenticatedUser | null
};