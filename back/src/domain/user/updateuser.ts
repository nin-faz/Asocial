import { MutationResolvers } from "../../types";
import { hashPassword } from "../../module/auth.js";
import { formatUsername } from "../../module/usernameFormatter.js";

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
      username: body.username?.trim()
        ? formatUsername(body?.username)
        : existUser.username,
      password: body.password?.trim()
        ? await hashPassword(body.password)
        : existUser.password,
      iconName: body.iconName ?? existUser.iconName,
      top1BadgeMessage: body.top1BadgeMessage ?? existUser.top1BadgeMessage,
      top1BadgeColor: body.top1BadgeColor ?? existUser.top1BadgeColor,
      top1BadgePreset: body.top1BadgePreset ?? existUser.top1BadgePreset,
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
        // Champs badge top 1
        top1BadgeMessage: updatedUser.top1BadgeMessage,
        top1BadgeColor: updatedUser.top1BadgeColor,
        top1BadgePreset: updatedUser.top1BadgePreset,
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
