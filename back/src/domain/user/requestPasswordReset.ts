import { MutationResolvers } from "../../types.js";
import { sendPasswordResetEmail } from "../../utils/sendPasswordResetEmail.js";
import crypto from "crypto";
import { formatUsername } from "../../module/usernameFormatter.js";

export const requestPasswordReset: NonNullable<
  MutationResolvers["requestPasswordReset"]
> = async (_, { email, username }, { dataSources: { db } }) => {
  try {
    // Vérifie si un utilisateur existe avec ce username
    const formattedUsername = formatUsername(username);
    const user = await db.user.findFirst({
      where: { username: formattedUsername },
    });
    if (!user) {
      console.error("Utilisateur", formattedUsername, "n'existe pas");
      return {
        code: 404,
        success: false,
        message: "Utilisateur non trouvé",
      };
    }
    // Génère un token unique
    const token = crypto.randomUUID();
    // Crée la demande de reset
    await db.passwordResetRequest.create({
      data: {
        email,
        username: formattedUsername,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 min
      },
    });
    // Envoie l'email (fonction à créer)
    await sendPasswordResetEmail(email, token, username);

    return {
      code: 200,
      success: true,
      message: "Un email de réinitialisation a été envoyé si l'adresse existe.",
    };
  } catch (e) {
    console.error("Erreur lors de la demande de réinitialisation :", e);
    return {
      code: 500,
      success: false,
      message: "Erreur lors de la demande de réinitialisation.",
    };
  }
};
