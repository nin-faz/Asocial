import { MutationResolvers } from "../../types";
import { hashPassword } from "../../module/auth.js";

export const updateUser: NonNullable<MutationResolvers["updateUser"]> = async (
  _,
  { id, body },
  { dataSources: { db }, user }
) => {
  try {
    if (!user) {
      return {
        code: 403,
        success: false,
        message: `Unauthorized`,
        user: null,
      };
    }

    const existUser = await db.user.findFirst({ where: { id } });
    if (!existUser) {
      return {
        code: 404,
        success: false,
        message: `User not found`,
        user: null,
      };
    }

    if (user.id !== existUser.id) {
      return {
        code: 403,
        success: false,
        message: `Unauthorized`,
        user: null,
      };
    }

    const updatedData = {
      bio: body.bio?.trim() ? body.bio : existUser.bio,
      username: body.username?.trim() ? body.username : existUser.username,
      password: body.password?.trim()
        ? await hashPassword(body.password)
        : existUser.password,
      iconName: body.iconName ? body.iconName : existUser.iconName,
    };

    if (Object.keys(updatedData).length === 0) {
      return {
        code: 400,
        success: false,
        message: `No valid fields provided for update`,
        user: null,
      };
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updatedData,
    });

    return {
      code: 214,
      success: true,
      message: `User ${existUser.username} has been updated`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        bio: updatedUser.bio,
        iconName: updatedUser.iconName,
        createdAt: updatedUser.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      code: 400,
      success: false,
      message: `User has not been updated : ${error}`,
      user: null,
    };
  }
};
