import { hashPassword } from "../../module/auth.js";
import { MutationResolvers } from "../../types.js";
import { formatUsername } from "../../module/usernameFormatter.js";

export const resetPassword: NonNullable<
  MutationResolvers["resetPassword"]
> = async (_, { username, newPassword }, { dataSources: { db } }) => {
  try {
    const formattedUsername = formatUsername(username);
    const user = await db.user.findFirst({
      where: { username: formattedUsername },
    });
    if (!user) {
      return {
        code: 404,
        success: false,
        message: "Utilisateur non trouvé",
      };
    }
    await db.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(newPassword) },
    });
    return {
      code: 200,
      success: true,
      message: "Mot de passe mis à jour avec succès",
    };
  } catch (e) {
    console.error("Error updating password:", e);
    return {
      code: 500,
      success: false,
      message: "Erreur lors de la mise à jour du mot de passe",
    };
  }
};
