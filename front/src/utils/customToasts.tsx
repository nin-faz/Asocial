import { toast } from "react-toastify";
import {
  Flame,
  Skull,
  MessageCircle,
  Trash2,
  Megaphone,
  Bomb,
  Save,
  AlarmClockOff,
} from "lucide-react";

const toastStyle = {
  background: "#2a0134",
  color: "#f0aaff",
  display: "flex",
  justifyContent: "start",
  alignItems: "start",
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

export const showReconnectToast = () => {
  const messages = [
    "Hey, t'as été reset ! Reconnecte-toi avant de semer le chaos.",
    "Ton esprit a été effacé. Reconnecte-toi pour reprendre le contrôle.",
    "Le système a rebooté ton âme. Connecte-toi, ou reste dans l’oubli.",
    "Nouveau départ, même désordre. Reconnecte-toi pour continuer.",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  toast.info(randomMessage, {
    icon: <Megaphone size={24} color="#f0aaff" />,
    style: toastStyle,
    autoClose: 7000,
  });
};

export const showEmptyInfoToRegister = () => {
  toast.error("Tu comptes écrire dans le vide ? Remplis ce champ d'abord.", {
    style: toastStyle,
    icon: <Skull size={24} color="#f0aaff" />,
  });
};

export const showEmptyInfoToLogin = () => {
  toast.error("Tu veux te connecter ? Remplis ce champ d'abord.", {
    style: toastStyle,
    icon: <Skull size={24} color="#f0aaff" />,
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

// Article
export const showArticleCreatedToast = () => {
  toast.success("Un nouveau cri dans le néant. Ton article est en ligne.", {
    icon: <Megaphone size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

export const showEmptyContentToast = () => {
  toast.error("Un article vide ? Sérieusement... Remplis-moi ça !", {
    style: toastStyle,
    icon: <Skull size={24} color="#f0aaff" />,
  });
};

export const showArticleUpdatedToast = () => {
  toast.success("Mise à jour appliquée. Retour au néant.", {
    icon: <Megaphone size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

export const showArticleDeletedToast = () => {
  toast.success("Bam! Article vaporisé ! 💥", {
    icon: <Bomb size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

// Comment
export const showCommentAddedToast = () => {
  toast.success("Ton cri dans le vide a été publié.", {
    icon: <MessageCircle size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

export const showCommentUpdatedToast = () => {
  const messages = [
    "Ta correction de pensée a été enregistrée dans le néant.",
    "Commentaire modifié. Comme si quelqu'un allait remarquer la différence.",
    "Mise à jour appliquée. Ton opinion améliorée reste toujours aussi inutile.",
    "Modification sauvegardée. Tu n'échapperas pas au vide pour autant.",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  toast.success(randomMessage, {
    icon: <MessageCircle size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

export const showCommentDeletedToast = () => {
  toast.success(
    "Ton commentaire a été effacé... comme s'il n'avait jamais existé.",
    {
      icon: <Trash2 size={24} color="#f0aaff" />,
      style: toastStyle,
    }
  );
};

// Profile
export const showProfileUpdatedToast = () => {
  const messages = [
    "Identité modifiée. Mais tu restes toujours aussi insignifiant.",
    "Changement enregistré. C'est presque comme si ça importait.",
    "Nouveau masque, même néant. Profil mis à jour.",
    "Profil rafraîchi. Le vide te va bien mieux maintenant.",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  toast.success(randomMessage, {
    icon: <Save size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

// Reset Password
export const showResetPasswordSuccessToast = () => {
  const messages = [
    "Mot de passe réinitialisé. T’es prêt à replonger dans Asocial ?",
    "C’est fait. Ton mot de passe est de retour… Évite qu’il tombe dans la faille.",
    "Mot de passe à jour. Ne va pas encore le balancer dans le vide interconnecté !",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  toast.success(randomMessage, {
    icon: <Flame size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

export const showResetPasswordErrorToast = () => {
  toast.error(
    "Une erreur est surevenue ... Vérifie le nom d'utilisateur ou réessaie plus tard.",
    {
      icon: <Skull size={24} color="#f0aaff" />,
      style: toastStyle,
    }
  );
};

// Reset Password: Email envoyé
export const showResetPasswordEmailSentToast = () => {
  const messages = [
    "Le lien est parti. Le retrouver, c’est ton problème maintenant.",
    "Un mail vient de partir dans le néant. Va voir ta boîte de réception (ou tes spams, on sait jamais).",
    "Lien envoyé ! Si l'adresse existe, tu devrais recevoir un message d'ici peu.",
    "Ta requête a été entendue. La suite se trouve dans ta boîte mail… ou pas.",
  ];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  toast.info(randomMessage, {
    icon: <Megaphone size={24} color="#f0aaff" />,
    style: toastStyle,
  });
};

export const showInvalidOrExpiredLinkToast = () => {
  toast.error(
    "Trop tard, ce lien a déjà rendu l’âme en expirant... Fait une nouvelle demande !",
    {
      icon: <AlarmClockOff size={24} color="#d00000" />,
      style: toastStyle,
    }
  );
};
