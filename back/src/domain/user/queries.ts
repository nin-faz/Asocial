import { QueryResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type UserQueries = WithRequired<QueryResolvers, 'findUserById'>;

export const resolvers: UserQueries = {
    findUserById: async (_parent, { id }, _context) => {
        console.log("Received ID:", id); // 🔥 Vérifier l'ID reçu
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }

        console.log("User found:", JSON.stringify(user)); // 🔥 Vérifier si un utilisateur est trouvé

        return {
            ...user,
            createdAt: user.createdAt.toISOString()
        };
    }
};
