import { hashPassword } from "../../module/auth.js";
import { formatUsername } from "../../module/usernameFormatter.js";
import { MutationResolvers } from "../../types.js";

export const createUser: NonNullable<MutationResolvers["createUser"]> = async (
  _,
  { username, password },
  { dataSources: { db } }
) => {
  try {
    // Format the username
    const formattedUsername = formatUsername(username);

    // Check if user already exists
    const existUser = await db.user.findFirst({
      where: {
        username: formattedUsername,
      },
    });

    if (existUser) {
      return {
        code: 403,
        success: false,
        message: `user ${formattedUsername} already exists`,
        user: null,
      };
    }

    const createdUser = await db.user.create({
      data: {
        username: formattedUsername,
        password: await hashPassword(password),
        bio: "Bienvenue sur mon profil !",
        createdAt: new Date(),
      },
    });

    return {
      code: 201,
      success: true,
      message: `user ${formattedUsername} has been created`,
      user: {
        id: createdUser.id,
        username: createdUser.username,
        bio: createdUser.bio,
        createdAt: createdUser.createdAt.toISOString(),
      },
    };
  } catch (error) {
    return {
      code: 400,
      message: "User has not been created : " + error,
      success: false,
      user: null,
    };
  }
};
