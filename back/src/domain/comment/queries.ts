import { QueryResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CommentQueries = WithRequired<QueryResolvers, "getComments">;

export const commentQueries: CommentQueries = {
  getComments: async (_, { articleId }, _context) => {
    const comments = await prisma.comment.findMany({
      where: { articleId, parentId: null },
      include: {
        author: true,
        dislikes: true,
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: { username: true },
            },
          },
        },
        replies: {
          include: {
            author: true,
            dislikes: true,
          },
        },
        _count: { select: { dislikes: true } },
      },
    });

    const processedComments = comments.map((comment) => ({
      ...comment,
      TotalDislikes: comment._count.dislikes,
    }));

    // Tri des commentaires du moins récent au plus récent, en tenant compte de updatedAt
    const sortedComments = processedComments.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime(); // Tri ascendant (moins récent au plus récent)
    });

    return sortedComments;
  },
};
