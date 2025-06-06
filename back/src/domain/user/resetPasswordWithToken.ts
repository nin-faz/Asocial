import { hashPassword } from "../../module/auth.js";
import { formatUsername } from "../../module/usernameFormatter.js";
import { MutationResolvers } from "../../types.js";

export const resetPasswordWithToken: NonNullable<
  MutationResolvers["resetPasswordWithToken"]
> = async (_, { token, username, newPassword }, { dataSources: { db } }) => {
  try {
    const request = await db.passwordResetRequest.findUnique({
      where: { token },
    });
    if (!request || request.expiresAt < new Date()) {
      // Si le token est expiré, on le supprime de la base
      if (request) {
        await db.passwordResetRequest.delete({ where: { token } });
      }
      console.error("Lien invalide ou expiré pour le token", token);
      return {
        code: 400,
        success: false,
        message: "Lien invalide ou expiré",
      };
    }
    const formattedUsername = formatUsername(username);
    if (request.username !== formattedUsername) {
      console.error("Pseudo invalide pour le token", token);
      return {
        code: 404,
        success: false,
        message: "Pseudo invalide",
      };
    }
    await db.user.update({
      where: { username: formattedUsername },
      data: { password: await hashPassword(newPassword) },
    });
    await db.passwordResetRequest.delete({ where: { token } });
    console.log("Mot de passe réinitialisé pour l'utilisateur", username);
    return {
      code: 200,
      success: true,
      message: "Mot de passe réinitialisé avec succès !",
    };
  } catch (e) {
    console.error("Error in resetPasswordWithToken:", e);
    return {
      code: 500,
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe.",
    };
  }
};
