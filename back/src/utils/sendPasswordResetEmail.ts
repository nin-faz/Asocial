import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username: string
) {
  // Configure ton transporteur SMTP ici (exemple Gmail, à adapter)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetUrl = `https://asocial-network.netlify.app/reset-password?token=${token}`;
  // const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      to: email,
      subject: "Réinitialisation de ton mot de passe Asocial",
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#1a1a2e !important; color:#f0aaff !important; padding:32px; border-radius:12px; border:2px solid #9c27b0; max-width:480px; margin:auto; background-color:#1a1a2e !important;">
        <h1 style="color:#9c27b0 !important; text-align:center; margin-bottom:24px;">🔒 Réinitialisation du mot de passe</h1>
        <p style="font-size:1.1em; margin-bottom:18px; color:#f0aaff !important;">Hey <strong style="color:#fff !important;">${username}</strong>,</p>
        <p style="margin-bottom:18px; color:#f0aaff !important;">Tu as demandé à réinitialiser ton mot de passe pour <span style="color:#9c27b0 !important; font-weight:bold;">Asocial</span>.</p>
        <p style="margin-bottom:24px; color:#f0aaff !important;">Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
        <div style="text-align:center; margin-bottom:24px;">
          <a href="${resetUrl}" style="display:inline-block; padding:14px 32px; background:#9c27b0 !important; color:#fff !important; text-decoration:none; border-radius:6px; font-weight:bold; font-size:1.1em; box-shadow:0 2px 8px #0002; transition:background 0.2s;">Réinitialiser mon mot de passe</a>
        </div>
        <p style="font-size:0.95em; color:#ccc !important; margin-bottom:8px;">Ce lien expire dans <strong>15 minutes</strong>.</p>
        <p style="font-size:0.9em; color:#777 !important;">Si ce n’est pas toi, ignore ce message, pas de stress.</p>
        <hr style="border:1px solid #4b3a66; margin:32px 0 16px 0;">
        <p style="color:#9c27b0 !important; text-align:center; font-size:1.1em;">L’équipe Asocial</p>
        <p style="text-align:center; font-size:0.9em; color:#444 !important; margin-top:8px;">asocial-network.netlify.app</p>
      </div>
      `,
    });

    console.log("Email de réinitialisation envoyé à", email);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw new Error("Erreur lors de l'envoi de l'email de réinitialisation.");
  }
}
