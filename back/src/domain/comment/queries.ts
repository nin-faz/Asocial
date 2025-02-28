import { QueryResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CommentQueries = WithRequired<QueryResolvers, 'getComments'>;

export const commentQueries: CommentQueries = {
    getComments: async (_, { articleId }, _context) => {      
        const comments = await prisma.comment.findMany({
            where: { articleId },
            include: { 
                _count: { select: { dislikes: true } }
            }
        });

        return comments.map(comment => ({
            ...comment,
            NbOfDislikes: comment._count?.dislikes !== undefined ? comment._count.dislikes : 0
        }));
    }
    
};

