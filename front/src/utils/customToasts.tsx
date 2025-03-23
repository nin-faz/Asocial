import { toast } from "react-toastify";
import {
  Flame,
  Skull,
  MessageCircle,
  Trash2,
  Megaphone,
  Bomb,
} from "lucide-react";
import React from "react";

const toastStyle = {
  background: "#2a0134",
  color: "#f0aaff",
};

// --- Login requis pour actions ---
export const showLoginRequiredToast = (
  action: "dislike" | "publish" | "comment"
) => {
  const messages = {
    dislike: [
      "Tu veux semer le chaos ? Connecte-toi d'abord, rebelle.",
      "Pas de dislike sans identité... Connecte-toi et libère ta haine.",
      "L'anarchie a ses règles : connecte-toi pour disliker.",
      "Tu crois pouvoir disliker incognito ? Rejoins le désordre connecté.",
    ],
    publish: [
      "Pas de publication sans identité... Connecte-toi et crée du chaos.",
      "Les idées n'ont pas de visage sans connexion... Connecte-toi pour publier.",
      "Pour faire entendre ta voix, tu dois être connecté.",
      "Rejoins le mouvement, publie ton cri dans le néant après t'être connecté.",
    ],
    comment: [
      "Ton avis compte ? Peut-être. Mais connecte-toi d’abord.",
      "Pas de commentaire fantôme. Connecte-toi pour t'exprimer.",
      "Exprime-toi… une fois connecté au néant.",
      "Tu veux commenter dans l’ombre ? Nope. Connexion requise.",
    ],
  };

  const randomMessage =
    messages[action][Math.floor(Math.random() * messages[action].length)];

  toast.warn(randomMessage, {
    style: toastStyle,
  });
};

// --- Connexion réussie ---
export const showLoginToast = () => {
  const messages = [
    "Revoilà l'anti-héros... enfin, juste un type paumé.",
    "Bienvenue dans l'abîme. L'espoir n'a jamais eu sa place ici.",
    "Encore toi ? On a toujours pas activé l’option éjection.",
    "Tu t’accroches, hein ? C’est presque touchant.",
    "Connexion réussie... mais à quoi bon ?",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  toast.success(randomMessage, {
    icon: <Flame size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

// --- Inscription réussie ---
export const showWelcomeToast = () => {
  toast.success(
    "T’as fait le pire choix possible. Mais bon, bienvenue quand même.",
    {
      icon: <Skull size={24} color="#f0aaff" />,
      style: toastStyle,
    }
  );
};

// --- Article publié ---
export const showArticleCreatedToast = () => {
  toast.success("Un nouveau cri dans le néant. Ton article est en ligne.", {
    icon: <Megaphone size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

// --- Article supprimé ---
export const showArticleDeletedToast = () => {
  toast.success("Bam! Article vaporisé ! 💥", {
    icon: <Bomb size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

// --- Commentaire ajouté ---
export const showCommentAddedToast = () => {
  toast.success("Ton cri dans le vide a été publié.", {
    icon: <MessageCircle size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

// --- Commentaire supprimé ---
export const showCommentDeletedToast = () => {
  toast.success(
    "Ton commentaire a été effacé... comme s'il n'avait jamais existé.",
    {
      icon: <Trash2 size={24} color="#f0aaff" />,
      style: toastStyle,
    }
  );
};
