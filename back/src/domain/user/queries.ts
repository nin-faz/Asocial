import { QueryResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type UserQueries = WithRequired<QueryResolvers, 'findUserById'>;


export const userQueries: UserQueries = {
    findUserById: async (_parent, { id }, _context) => {
        const user = await prisma.user.findUnique({
            where: { id : String(id) }
        });

        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }

        return {
            ...user,
            createdAt: user.createdAt.toISOString()
        };
    }
};
