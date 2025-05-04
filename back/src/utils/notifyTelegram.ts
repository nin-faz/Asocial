import "dotenv/config";

export const notifyTelegram = async (message: string) => {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(
        message
      )}`
    );
    const data = await response.json();
    console.log("Telegram réponse:", data);
  } catch (error) {
    console.error("Erreur Telegram:", error);
  }
};
