import { QueryResolvers } from "../../types.js";
import { WithRequired } from "../../utils/mapped-type.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type UserQueries = WithRequired<
  QueryResolvers,
  "findUserById" | "findAllUsers" | "getTop1User" | "searchUsers"
>;

export const userQueries: UserQueries = {
  findUserById: async (_parent, { id }, _context) => {
    const user = await prisma.user.findUnique({
      where: { id: String(id) },
      include: {
        _count: {
          select: { articles: true, comments: true },
        },
        articles: {
          select: {
            _count: { select: { dislikes: true, comments: true } },
          },
        },
      },
    });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const totalDislikes = user.articles.reduce(
      (sum, a) => sum + a._count.dislikes,
      0,
    );
    const totalComments = user.articles.reduce(
      (sum, a) => sum + a._count.comments,
      0,
    );

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      iconName: user.iconName,
      createdAt: user.createdAt.toISOString(),
      TotalDislikes: totalDislikes,
      TotalComments: totalComments,
      // top1Badge fields - LEADERBOARD DISABLED
      // top1BadgeMessage: user.top1BadgeMessage,
      // top1BadgeColor: user.top1BadgeColor,
      // top1BadgePreset: user.top1BadgePreset,
    };
  },
  getTop1User: async () => {
    const users = await prisma.user.findMany({
      include: {
        _count: { select: { articles: true, comments: true } },
        articles: {
          select: {
            _count: { select: { dislikes: true, comments: true } },
          },
        },
      },
    });

    const scored = users.map((user) => {
      const totalDislikes = user.articles.reduce(
        (sum, a) => sum + a._count.dislikes,
        0,
      );
      const totalComments = user.articles.reduce(
        (sum, a) => sum + a._count.comments,
        0,
      );
      const scoreGlobal =
        user._count.articles * 3 +
        totalComments * 1.5 +
        totalDislikes +
        user._count.comments;
      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        TotalDislikes: totalDislikes,
        TotalComments: totalComments,
        scoreGlobal,
      };
    });

    return (
      scored.sort((a, b) => (b.scoreGlobal ?? 0) - (a.scoreGlobal ?? 0))[0] ??
      null
    );
  },
  searchUsers: async (_parent, { query }) => {
    const users = await prisma.user.findMany({
      where: {
        username: { contains: String(query), mode: "insensitive" },
      },
      select: { id: true, username: true, createdAt: true },
      take: 10,
    });
    return users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }));
  },
  findAllUsers: async () => {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { articles: true, comments: true },
        },
        articles: {
          select: {
            _count: { select: { dislikes: true, comments: true } },
          },
        },
      },
    });

    return users.map((user) => {
      const totalDislikes = user.articles.reduce(
        (sum, a) => sum + a._count.dislikes,
        0,
      );
      const totalComments = user.articles.reduce(
        (sum, a) => sum + a._count.comments,
        0,
      );
      const publications = user._count.articles;
      const commentsWritten = user._count.comments;
      const scoreGlobal =
        publications * 3 +
        totalComments * 1.5 +
        totalDislikes * 1 +
        commentsWritten * 1;

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        // top1Badge fields - LEADERBOARD DISABLED
        // top1BadgeMessage: user.top1BadgeMessage,
        // top1BadgeColor: user.top1BadgeColor,
        // top1BadgePreset: user.top1BadgePreset,
        TotalDislikes: totalDislikes,
        TotalComments: totalComments,
        scoreGlobal,
      };
    });
  },
};
