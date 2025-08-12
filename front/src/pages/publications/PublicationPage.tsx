import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ThumbsDown,
  MessageSquare,
  Skull,
  MoreVertical,
  SortDesc,
  Trash2,
  Edit2,
  Share2,
  RefreshCw,
  ChevronUp,
} from "lucide-react";
import { useMutation, useQuery } from "@apollo/client";
import Loader from "../../components/Loader";
import {
  CREATE_ARTICLE,
  ADD_ARTICLE_DISLIKE,
  DELETE_ARTICLE_DISLIKE,
  DELETE_ARTICLE,
} from "../../mutations";
import {
  FIND_ARTICLES,
  FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES,
  FIND_ARTICLE_BY_MOST_DISLIKED,
  GET_USER_BY_ID,
  GET_USERS,
} from "../../queries";
import { FindArticlesQuery } from "../../gql/graphql";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import {
  showArticleCreatedToast,
  showArticleDeletedToast,
  showEmptyContentToast,
  showLoginRequiredToast,
} from "../../utils/customToasts";
import UserIcon from "../../components/icons/UserIcon";
import MediaUploader from "../../components/media/MediaUploader";
import getCaretCoordinates from "textarea-caret-position";
import { GET_LEADERBOARD } from "../../queries/userQuery";
import { BadgeTop1, BadgePreset } from "../../components/BadgeTop1";

function PublicationPage() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { token, user } = authContext;
  const navigate = useNavigate();
  const location = useLocation();

  // État pour afficher/masquer le bouton de retour en haut
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fonction pour remonter en haut de la page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Vérifier si on doit afficher le bouton de retour en haut
  useEffect(() => {
    const handleScroll = () => {
      // Afficher le bouton quand on descend de plus de 500px
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Obtenir les informations utilisateur, y compris l'icône
  const { data: userData, refetch: refetchUserData } = useQuery(
    GET_USER_BY_ID,
    {
      variables: { id: user?.id! },
      skip: !user?.id,
    }
  );

  const userIconName = userData?.findUserById?.iconName ?? "Skull";

  const {
    data,
    loading: articlesLoading,
    refetch: refetchArticles,
  } = useQuery(FIND_ARTICLES, {
    fetchPolicy: "network-only", // Force une nouvelle requête réseau pour contourner les problèmes de cache
    nextFetchPolicy: "cache-and-network", // Met à jour en arrière-plan après le premier affichage
  });
  const articles = data?.findArticles || [];

  // État pour suivre si un rafraîchissement est nécessaire
  const [needsRefresh, setNeedsRefresh] = useState(true);

  // Effet au chargement pour rafraîchir les données immédiatement
  useEffect(() => {
    if (needsRefresh) {
      // Exécution immédiate pour éviter le délai initial
      refetchArticles();
      if (user?.id) {
        refetchUserData();
      }
      setNeedsRefresh(false);
    }
  }, [refetchArticles, refetchUserData, user?.id, needsRefresh]);

  const {
    data: mostDislikedArticles,
    loading: mostDislikedLoading,
    refetch: refetechMostDislikedArticles,
  } = useQuery(FIND_ARTICLE_BY_MOST_DISLIKED, {
    fetchPolicy: "cache-first", // Priorise le cache pour un affichage ultra-rapide
    nextFetchPolicy: "cache-and-network", // Met à jour en arrière-plan après le premier affichage
  });
  const mostDisliked = mostDislikedArticles?.findArticleByMostDisliked || [];

  type ArticleType = NonNullable<
    NonNullable<FindArticlesQuery["findArticles"]>[number]
  >;

  const [sortOption, setSortOption] = useState("recent");
  const displayedArticles: ArticleType[] = (
    sortOption === "recent" ? articles : mostDisliked
  ).filter((article): article is ArticleType => article !== null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Infinite scroll : combien d'articles afficher ?
  const [articlesToShow, setArticlesToShow] = useState(10);
  const articlesPerScroll = 10;

  const { searchTerm } = useSearch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Utiliser useMemo pour mémoriser les articles filtrés
  const filteredArticles = useMemo(() => {
    return searchTerm.trim()
      ? displayedArticles.filter((article) => {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const titleMatch = article?.title
            ? article.title.toLowerCase().includes(lowerSearchTerm)
            : false;
          const contentMatch = article.content
            ? article.content.toLowerCase().includes(lowerSearchTerm)
            : false;
          const authorMatch = article.author.username
            .toLowerCase()
            .includes(lowerSearchTerm);
          return titleMatch || contentMatch || authorMatch;
        })
      : displayedArticles;
  }, [displayedArticles, searchTerm]);

  // Infinite scroll : articles à afficher
  const visibleArticles = useMemo(() => {
    return filteredArticles.slice(0, articlesToShow);
  }, [filteredArticles, articlesToShow]);

  // Vérifie que nous avons des articles soit dans les données brutes ou dans les données filtrées
  const hasArticles = useMemo(
    () =>
      filteredArticles.length > 0 ||
      (data?.findArticles?.length ?? 0) > 0 ||
      (mostDislikedArticles?.findArticleByMostDisliked?.length ?? 0) > 0,
    [
      filteredArticles,
      data?.findArticles,
      mostDislikedArticles?.findArticleByMostDisliked,
    ]
  );
  const hasMore = articlesToShow < filteredArticles.length;

  // Gestion du scroll infini
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 800; // Déclenche 800px avant le bas
      if (scrollPosition >= threshold) {
        setArticlesToShow((prev) =>
          Math.min(prev + articlesPerScroll, filteredArticles.length)
        );
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, filteredArticles.length]);

  // Rafraîchir les articles au chargement
  useEffect(() => {
    if (user?.id) {
      refetchUserData();
    }
  }, [user?.id, refetchUserData]);

  const [createArticle, { loading: isCreatingArticle }] =
    useMutation(CREATE_ARTICLE);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Indique aux pages de détails de rafraîchir les commentaires si besoin
    sessionStorage.setItem("forceRefetchComments", "1");

    try {
      // Rafraîchir selon l'option de tri sélectionnée
      if (sortOption === "unpopular") {
        await refetechMostDislikedArticles();
      } else {
        await refetchArticles();
      }

      // Rafraîchir les données utilisateur si connecté
      if (user?.id) {
        await refetchUserData();
      }

      // Rafraîchir les dislikes si l'utilisateur est connecté
      if (user?.id) {
        await refetchDislikeUser();
      }

      toast.success("Publications rafraîchies", {
        style: {
          background: "#2a0134",
          color: "#f0aaff",
        },
        icon: <RefreshCw className="text-purple-400" size={18} />,
      });
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      toast.error("Impossible de rafraîchir les publications");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Ajoutez cette nouvelle variable d'état pour gérer l'article en cours de création
  const [tempArticleId, setTempArticleId] = useState<string | null>(null);
  const [tempArticleData, setTempArticleData] = useState<{
    title: string;
    content: string;
    imageUrl: string | null;
    videoUrl: string | null;
  }>({
    title: "",
    content: "",
    imageUrl: null,
    videoUrl: null,
  });

  const handleCreateArticle = async () => {
    if (!user) {
      showLoginRequiredToast("publish");
      return;
    }

    if (title.trim() === "" && content.trim() === "") {
      showEmptyContentToast();
      return;
    }

    try {
      // Générer des datas temporaires pour l'article en cours de création
      setTempArticleId(`temp-${Date.now()}`);
      setTempArticleData({ title: title.trim(), content, imageUrl, videoUrl });

      const response = await createArticle({
        variables: {
          title: title.trim() || null,
          content,
          imageUrl,
          videoUrl,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (response.data?.createArticle?.success) {
        setTitle("");
        setContent("");
        setImageUrl(null);
        setVideoUrl(null);

        // Indique que le rafraîchissement est en cours
        setIsRefreshing(true);

        // Rafraîchir uniquement les articles récents
        await refetchArticles();

        // Rafraîchir les articles les plus dislikés seulement si nécessaire
        if (sortOption === "unpopular") {
          setTimeout(() => {
            refetechMostDislikedArticles();
          }, 1000);
        }

        // Indiquer que le rafraîchissement est terminé
        setIsRefreshing(false);
        setTempArticleId(null);
        setTempArticleData({
          title: "",
          content: "",
          imageUrl: null,
          videoUrl: null,
        });

        showArticleCreatedToast();
        console.log("Article créé avec succès !");
      } else {
        console.error(
          response?.data?.createArticle?.message ??
            "Echec de la création de l'article:"
        );
        setTempArticleId(null); // Supprimer l'article temporaire en cas d'échec
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error("Une erreur est survenue : " + err.message);
      } else {
        toast.error("Une erreur est survenue");
      }
      setIsRefreshing(false);
      setTempArticleId(null);
      setTempArticleData({
        title: "",
        content: "",
        imageUrl: null,
        videoUrl: null,
      });
    }
  };

  const handleEditArticle = (articleId: string) => {
    navigate(`/publications/${articleId}?edit=true`);
  };

  const [showMenu, setShowMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [deleteArticle] = useMutation(DELETE_ARTICLE);

  const [deletedArticleIds, setDeletedArticleIds] = useState<string[]>([]);

  const handleDeleteArticle = async (articleId: string) => {
    setDeletedArticleIds((prev) => [...prev, articleId]);
    showArticleDeletedToast();

    try {
      const response = await deleteArticle({
        variables: { id: articleId },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (response.data?.deleteArticle?.success) {
        if (sortOption === "unpopular") {
          await refetechMostDislikedArticles();
        } else {
          await refetchArticles();
        }
        console.log("Article supprimé avec succès !");
      } else {
        console.error(
          response?.data?.deleteArticle?.message ??
            "Echec de la suppression de l'article."
        );
        setDeletedArticleIds((prev) => prev.filter((id) => id !== articleId));
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        toast.error("Une erreur est survenue : " + err.message);
      } else {
        toast.error("Une erreur est survenue");
      }
      setDeletedArticleIds((prev) => prev.filter((id) => id !== articleId));
    }
  };

  // Restauration du scroll APRÈS que la page soit assez longue
  const hasRestoredScroll = useRef(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);
  useEffect(() => {
    const scrollY =
      location.state?.scrollY ??
      Number(sessionStorage.getItem("publicationScroll"));
    if (
      !hasRestoredScroll.current &&
      typeof scrollY === "number" &&
      scrollY > 0
    ) {
      setIsRestoringScroll(true);
      // Masque le scroll pendant la restauration
      document.body.style.overflow = "hidden";
      const tryRestore = () => {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        if (maxScroll >= scrollY || !hasMore) {
          window.scrollTo(0, scrollY);
          hasRestoredScroll.current = true;
          sessionStorage.removeItem("publicationScroll");
          setTimeout(() => {
            setIsRestoringScroll(false);
            document.body.style.overflow = "";
            navigate("/publications", { replace: true, state: {} });
          }, 0);
        } else {
          setArticlesToShow((prev) =>
            Math.min(prev + articlesPerScroll, filteredArticles.length)
          );
          setTimeout(tryRestore);
        }
      };
      tryRestore();
      return () => {
        document.body.style.overflow = "";
      };
    } else {
      setIsRestoringScroll(false);
      document.body.style.overflow = "";
    }
  }, [
    location.state,
    hasMore,
    filteredArticles.length,
    navigate,
    articlesPerScroll,
    articlesToShow,
  ]);

  // Correction : forcer le scroll à la position 1px au chargement si une restauration est attendue
  useEffect(() => {
    const scrollY =
      location.state?.scrollY ??
      Number(sessionStorage.getItem("publicationScroll"));
    if (typeof scrollY === "number" && scrollY > 0) {
      window.scrollTo(0, 1); // Empêche le navigateur de scroller tout en bas par défaut sur mobile
    }
  }, []);
  // Remet au cas où c'est bizarre
  // useEffect(() => {
  //   const scrollY = sessionStorage.getItem("publicationScroll");
  //   if (scrollY) {
  //     // Décale un peu le scroll pour être sûr que le DOM est prêt
  //     window.requestAnimationFrame(() => {
  //       window.scrollTo(0, Number(scrollY));
  //       sessionStorage.removeItem("publicationScroll");
  //     });
  //   }
  // }, []);

  const handlePostClick = (articleId: string) => {
    sessionStorage.setItem("publicationScroll", window.scrollY.toString());
    navigate(`/publications/${articleId}`);
  };

  const { data: dislikeUser, refetch: refetchDislikeUser } = useQuery(
    FIND_DISLIKES_BY_USER_ID_FOR_ARTICLES,
    {
      variables: { userId: user?.id! },
      skip: !user?.id,
    }
  );

  const [userDislikes, setUserDislikes] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Met à jour userDislikes en fonction des articles et des dislikes de l'utilisateur
  useEffect(() => {
    if (!user) {
      if (Object.keys(userDislikes).length !== 0) {
        setUserDislikes({});
      }
      return;
    }

    const dislikesMap: { [key: string]: boolean } = {};

    // Vérifie les articles dislikés dans displayedArticles
    displayedArticles.forEach(({ id, dislikes = [] }) => {
      if (dislikes?.some((dislike) => dislike?.user?.id === user?.id)) {
        dislikesMap[id] = true;
      }
    });

    // Vérifie les dislikes récupérés depuis la requête GraphQL
    if (dislikeUser?.getDislikesByUserIdForArticles) {
      dislikeUser.getDislikesByUserIdForArticles.forEach((dislike) => {
        if (dislike?.article) {
          dislikesMap[dislike.article.id] = true;
        }
      });
    }

    const isEqual = (a: typeof userDislikes, b: typeof dislikesMap) => {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((key) => a[key] === b[key]);
    };

    if (!isEqual(userDislikes, dislikesMap)) {
      setUserDislikes(dislikesMap);
    }
  }, [articles, mostDisliked, dislikeUser, user?.id, sortOption]);

  const [addDislike] = useMutation(ADD_ARTICLE_DISLIKE);
  const [deleteDislike] = useMutation(DELETE_ARTICLE_DISLIKE);

  const handleDislike = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();

    if (!articleId) {
      console.error("ID article manquant !");
      return;
    }

    if (!user) {
      showLoginRequiredToast("dislike");
      return;
    }

    try {
      // Mettre à jour l'état local immédiatement pour une réponse instantanée
      const newDislikeState = !userDislikes[articleId];
      setUserDislikes((prev) => ({
        ...prev,
        [articleId]: newDislikeState,
      }));

      // Mettre à jour visuellement le compteur de dislikes
      const articleElement = document.querySelector(
        `[data-article-id="${articleId}"]`
      );
      if (articleElement) {
        const dislikeCountElement =
          articleElement.querySelector(".dislike-count");
        if (dislikeCountElement) {
          const currentCount = parseInt(
            dislikeCountElement.textContent ?? "0",
            10
          );
          dislikeCountElement.textContent = String(
            newDislikeState ? currentCount + 1 : currentCount - 1
          );
        }
      }

      if (newDislikeState) {
        // Ajoute le dislike
        await addDislike({ variables: { articleId, userId: user.id! } });
        console.log(user.username, "a disliké l'article.");
      } else {
        // Supprime le dislike
        await deleteDislike({ variables: { articleId, userId: user.id! } });
        console.log(user.username, "a retiré son dislike.");
      }

      // Rafraîchir uniquement les données de dislike de l'utilisateur
      // sans recharger tous les articles
      await refetchDislikeUser();

      // Planifier un rafraîchissement différé des articles pour éviter
      // de bloquer l'interface utilisateur
      setTimeout(() => {
        if (sortOption === "unpopular") {
          refetechMostDislikedArticles();
        }
      }, 2000);
    } catch (error) {
      // En cas d'erreur, remettre l'état précédent
      setUserDislikes((prev) => ({
        ...prev,
        [articleId]: !userDislikes[articleId],
      }));
      console.error("Erreur lors de l'ajout/suppression du dislike :", error);
    }
  };

  // État pour les suggestions de mentions
  const [mentionSuggestions, setMentionSuggestions] = useState<
    { id: string; username: string; __typename?: string }[]
  >([]);
  const [showMentionList, setShowMentionList] = useState(false); // État pour afficher ou masquer la liste des mentions
  const mentionListRef = useRef<HTMLDivElement | null>(null); // Référence pour la liste déroulante

  const { data: usersData } = useQuery(GET_USERS); // Requête pour récupérer les utilisateurs

  // Ajout des états manquants
  const [mentionListPosition, setMentionListPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [activeField, setActiveField] = useState<"title" | "content" | null>(
    null
  );

  const [selectedIndexUser, setSelectedIndexUser] = useState(0);

  // Ajout des références manquantes
  const titleInputRef = useRef<HTMLTextAreaElement | null>(null);
  const contentInputRef = useRef<HTMLTextAreaElement | null>(null);

  const mentionItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Fonction pour détecter les mentions dans le texte
  const handleTextChange = (
    text: string,
    setText: React.Dispatch<React.SetStateAction<string>>,
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  ) => {
    if (!inputRef?.current) return;

    setText(text);

    // Detect mention trigger and position list under caret
    const mentionRegex = /@([a-zA-Z0-9_.\-' ]*)$/;
    const mentionMatch = mentionRegex.exec(text);
    if (mentionMatch && inputRef.current) {
      const el = inputRef.current as any;
      let topPos: number;
      let leftPos: number;
      const width = el.getBoundingClientRect().width;
      if (el.tagName === "TEXTAREA") {
        const pos = el.selectionStart || 0;
        let coords;
        try {
          coords = getCaretCoordinates(el, pos);
        } catch {
          const rectFallback = el.getBoundingClientRect();
          coords = { top: 0, left: 0, height: rectFallback.height };
        }
        const rect = el.getBoundingClientRect();
        topPos = rect.top + coords.top + coords.height + window.scrollY;
        leftPos = rect.left + coords.left + window.scrollX;
      } else {
        // fallback for input fields
        const rect = el.getBoundingClientRect();
        topPos = rect.top + rect.height + window.scrollY;
        leftPos = rect.left + window.scrollX + 4;
      }
      setMentionListPosition({ top: topPos, left: leftPos, width });
      const query = mentionMatch[1].toLowerCase();
      const suggestions = usersData?.findAllUsers?.filter((user: any) =>
        user.username.toLowerCase().startsWith(query)
      );
      setMentionSuggestions(suggestions || []);
      setSelectedIndexUser(0);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  // Update the insertMention function to dynamically determine the active field
  const insertMention = (
    username: string,
    setText: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setText((prev) => {
      const updatedText = prev.replace(
        /@([a-zA-Z0-9_.\-' ]*)$/,
        `@${username}`
      );
      return updatedText;
    });
    setShowMentionList(false);
  };

  // Définition correcte de handleKeyDown comme fonction React
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!showMentionList || mentionSuggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndexUser((prev) => (prev + 1) % mentionSuggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndexUser((prev) =>
        prev === 0 ? mentionSuggestions.length - 1 : prev - 1
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      insertMention(
        mentionSuggestions[selectedIndexUser].username,
        activeField === "title" ? setTitle : setContent
      );
    }
  };

  // Ajout d'un effet pour fermer la liste des mentions si l'utilisateur clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionListRef.current &&
        !mentionListRef.current.contains(event.target as Node)
      ) {
        setShowMentionList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showMentionList && mentionItemRefs.current[selectedIndexUser]) {
      mentionItemRefs.current[selectedIndexUser]?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    }
  }, [selectedIndexUser, showMentionList]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("mention")) {
        const username = target.getAttribute("data-username");
        if (username) {
          e.stopPropagation();
          navigate(`/users/${userData?.findUserById?.id}`);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // Ajout de la logique pour surligner les mentions dans le texte
  const highlightMentions = (text: string) => {
    const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const withMentions = escaped.replace(
      /@([a-zA-Z0-9_.\-']+)(?=\s|$)/g,
      `<span class="mention text-purple-500 cursor-pointer hover:underline" data-username="$1">@$1</span>`
    );
    return withMentions.replace(/\n/g, "<br>");
  };

  // Fonction pour partager un article
  const handleShareArticle = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/publications/${articleId}`;
    const shareTitle = "Découvrez cet article sur Asocial";
    const shareText = "Rejoignez la discussion sur cet article intéressant!";

    try {
      // Vérifier si l'API Web Share est disponible
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: copier le lien dans le presse-papier
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Lien copié dans le presse-papier!");
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      toast.error("Impossible de partager cet article");
    }
  };

  const { data: leaderboardData } = useQuery(GET_LEADERBOARD);
  // Récupérer le top 1 du leaderboard
  const top1User = leaderboardData?.findAllUsers?.length
    ? [...leaderboardData.findAllUsers].sort(
        (a, b) => (b.scoreGlobal ?? 0) - (a.scoreGlobal ?? 0)
      )[0]
    : null;

  // Vérifier si les données sont en cours de chargement
  const isLoading = articlesLoading || mostDislikedLoading;

  // Afficher le loader pendant le chargement des articles
  if (isRestoringScroll || isLoading) {
    return <Loader />;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-purple-400">Publications</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="bg-gray-800 text-gray-300 p-1.5 sm:p-2.5 rounded-lg border border-gray-700 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
            title="Rafraîchir les publications"
          >
            <RefreshCw
              className={`h-5 w-5 text-purple-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>
          <div className="relative flex items-center">
            <SortDesc className="absolute left-3 text-gray-500 h-4 w-4" />
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                console.log("Nouveau tri : ", e.target.value);
              }}
              className="bg-gray-800 text-gray-300 text-xs sm:text-base p-2 pl-8 sm:px-10 sm:py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
            >
              <option value="recent">Les plus récentes</option>
              <option value="unpopular">Les plus impopulaires</option>
            </select>
            <div className="absolute right-3 pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* Créer un article */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-lg p-4 mb-8 border border-purple-900"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
              {user ? (
                <UserIcon iconName={userIconName} size="small" />
              ) : (
                <Skull className="h-6 w-6 text-purple-400" />
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-4 w-full">
            <div className="relative">
              <div
                className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlightMentions(title) + "<br>",
                }}
              />
              <textarea
                value={title}
                onChange={(e) =>
                  handleTextChange(e.target.value, setTitle, titleInputRef)
                }
                onFocus={() => setActiveField("title")}
                ref={titleInputRef}
                className="absolute top-0 left-0 w-full h-full bg-transparent text-transparent caret-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 min-h-[60px] resize-none"
                placeholder="Titre de l'article (Optionnel)"
                onKeyDown={handleKeyDown}
                style={{ caretColor: "white" }}
              />
            </div>
            <div className="relative">
              <div
                className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: highlightMentions(content) + "<br>",
                }}
              />
              <textarea
                placeholder="Partagez vos pensées les plus sombres..."
                value={content}
                onChange={(e) =>
                  handleTextChange(e.target.value, setContent, contentInputRef)
                }
                onFocus={() => setActiveField("content")}
                ref={contentInputRef}
                onKeyDown={handleKeyDown}
                className="absolute top-0 left-0 w-full h-full bg-transparent text-transparent caret-white rounded-lg p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 resize-none"
                style={{ caretColor: "white" }}
              />
            </div>
            {/* Ajout du téléchargeur d'image */}
            <MediaUploader
              imageUrl={imageUrl}
              onImageChange={setImageUrl}
              videoUrl={videoUrl}
              onVideoChange={setVideoUrl}
            />
            <div className="flex flex-col w-full">
              <div className="flex justify-end mt-3">
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 flex items-center space-x-2"
                  onClick={handleCreateArticle}
                  disabled={isCreatingArticle || isRefreshing}
                >
                  {isCreatingArticle ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Publication en cours...</span>
                    </>
                  ) : (
                    <span>Publier</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>{" "}
      {/* Articles List */}
      <div className="space-y-10">
        {/* Article temporaire en cours de création */}
        {tempArticleId && (
          <motion.div
            key={tempArticleId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg p-6 border border-purple-900 relative overflow-hidden min-h-28"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                  <UserIcon iconName={userIconName} size="small" />
                </div>
                <div>
                  <h3 className="text-purple-400 font-semibold">
                    {user?.username}
                  </h3>{" "}
                  <p className="text-gray-500 text-sm">
                    Le{" "}
                    {new Date()
                      .toLocaleString("fr-FR", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      .replace(",", " à")}
                  </p>
                </div>
              </div>
            </div>

            {tempArticleData.title && <h2>{tempArticleData.title}</h2>}

            <p className="text-gray-300 mb-4 whitespace-pre-wrap">
              {tempArticleData.content}
            </p>

            {tempArticleData.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <picture>
                  <source
                    srcSet={tempArticleData.imageUrl.replace(
                      /\.(jpg|jpeg|png)$/i,
                      ".webp"
                    )}
                    type="image/webp"
                  />
                  <img
                    src={tempArticleData.imageUrl}
                    alt="Article en cours de publication"
                    className="w-full h-auto rounded-lg max-h-80 object-cover"
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={450}
                  />
                </picture>
              </div>
            )}

            {tempArticleData.videoUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <video
                  src={tempArticleData.videoUrl}
                  controls
                  preload="metadata"
                  playsInline
                  webkit-playsinline="true"
                  controlsList="nodownload"
                  className="w-full h-auto rounded-lg max-h-80"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Votre navigateur ne prend pas en charge la lecture vidéo.
                </video>
              </div>
            )}

            {/* Overlay de chargement */}
            <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="animate-spin h-10 w-10 mx-auto mb-4 text-purple-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-purple-400 font-medium">
                  Publication en cours...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {hasArticles ? (
          visibleArticles
            .filter(
              (article) =>
                article !== null && !deletedArticleIds.includes(article.id)
            )
            .map(
              ({
                id: articleId,
                title,
                content,
                imageUrl,
                videoUrl,
                author,
                createdAt,
                updatedAt,
                TotalDislikes,
                TotalComments,
              }) => (
                <motion.div
                  key={articleId}
                  data-article-id={articleId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
                    transition: {
                      duration: 0.2,
                      ease: "easeOut",
                    },
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gray-900 rounded-lg p-6 border border-purple-900 cursor-pointer hover:border-purple-700 transition-colors"
                  onClick={() => handlePostClick(articleId)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/users/${author.id}`);
                        }}
                        title={`Voir le profil de ${author.username}`}
                      >
                        <UserIcon iconName={author.iconName} size="small" />
                      </button>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <button
                            className="text-purple-400 font-semibold hover:underline focus:outline-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${author.id}`);
                            }}
                            title={`Voir le profil de ${author.username}`}
                          >
                            {author.username}
                          </button>
                          {top1User && author.id === top1User.id && (
                            <BadgeTop1
                              message={top1User.top1BadgeMessage}
                              color={top1User.top1BadgeColor}
                              preset={top1User.top1BadgePreset as BadgePreset}
                              className="ml-2"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">
                            Le{" "}
                            {updatedAt
                              ? new Date(parseInt(updatedAt, 10))
                                  .toLocaleString("fr-FR", {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  .replace(" ", " à ")
                              : new Date(parseInt(createdAt ?? "0", 10))
                                  .toLocaleString("fr-FR", {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  .replace(" ", " à ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {author.id === user?.id && (
                      <div className="relative">
                        <button
                          className="text-gray-500 hover:text-purple-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(
                              articleId === showMenu ? null : articleId
                            );
                          }}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {showMenu === articleId && (
                          <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-0 right-5 w-36 bg-gray-800 text-white rounded-md shadow-lg p-2 space-y-2 z-10"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteArticle(articleId);
                                setShowMenu(null);
                              }}
                              className="flex items-center space-x-2 text-red-500 hover:text-red-400 w-full"
                            >
                              <Trash2 className="h-5 w-5" />
                              <span>Supprimer</span>
                            </button>
                            <hr className="border-gray-700" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditArticle(articleId);
                                setShowMenu(null);
                              }}
                              className="flex items-center space-x-2 text-purple-500 hover:text-purple-400 w-full"
                            >
                              <Edit2 className="h-5 w-5" />
                              <span>Modifier</span>
                            </button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                  <h2
                    className="text-xl font-semibold text-purple-400 mb-2"
                    dangerouslySetInnerHTML={{
                      __html: highlightMentions(title ?? ""),
                    }}
                  ></h2>

                  <p
                    className="text-gray-300 mb-4 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: highlightMentions(content),
                    }}
                  ></p>

                  {/* Affichage de l'image si elle existe */}
                  {imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <picture>
                        <source
                          srcSet={imageUrl.replace(
                            /\.(jpg|jpeg|png)$/i,
                            ".webp"
                          )}
                          type="image/webp"
                        />
                        <img
                          src={imageUrl}
                          alt="Article"
                          className="w-full max-w-[800px] h-auto rounded-lg max-h-[350px] sm:max-h-dvh object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    </div>
                  )}

                  {/* Affichage de la vidéo si elle existe */}
                  {videoUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <video
                        src={videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        preload="metadata"
                        controlsList="nodownload"
                        className="w-full max-w-[800px] h-auto rounded-lg max-h-[350px] sm:max-h-dvh"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        Votre navigateur ne prend pas en charge la lecture
                        vidéo.
                      </video>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-500">
                    <div className="flex items-center space-x-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 hover:text-purple-400 ${
                          user && userDislikes[articleId]
                            ? "text-purple-400"
                            : "text-gray-500"
                        }`}
                        onClick={(e) => handleDislike(e, articleId)}
                      >
                        <ThumbsDown className="h-5 w-5" />
                        <span className="dislike-count">{TotalDislikes}</span>
                      </motion.button>

                      <button
                        className="flex items-center space-x-2 hover:text-purple-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePostClick(articleId);
                        }}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>{TotalComments}</span>
                      </button>
                    </div>

                    <button
                      className="flex items-center space-x-2 hover:text-purple-400"
                      onClick={(e) => handleShareArticle(e, articleId)}
                    >
                      <Share2 className="h-5 w-5" />
                      <span>Partager</span>
                    </button>
                  </div>
                </motion.div>
              )
            )
        ) : (
          <p className="text-center text-gray-400">Aucun article trouvé.</p>
        )}
      </div>
      {/* Optionnel : loader en bas si hasMore */}
      {hasMore && (
        <div className="flex justify-center py-48">
          <motion.div
            className="w-16 h-16 border-t-4 border-purple-500 rounded-full animate-spin"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
      )}
      {/* Ajout de la liste déroulante pour les mentions */}
      {showMentionList && mentionSuggestions.length > 0 && (
        <div
          ref={mentionListRef}
          className="absolute bg-[#1a1a1a] border border-[#333] rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto"
          style={{
            top: `${mentionListPosition.top}px`,
            left: `${mentionListPosition.left}px`,
            width: `${mentionListPosition.width}px`,
            position: "absolute",
          }}
        >
          {mentionSuggestions.map((user, index) => (
            <button
              key={user.id}
              ref={(el) => {
                if (mentionItemRefs.current) {
                  mentionItemRefs.current[index] = el;
                }
              }}
              className={`px-4 py-2 hover:bg-purple-500 cursor-pointer text-gray-300 w-full text-left
              ${
                index === selectedIndexUser
                  ? "bg-purple-900"
                  : "hover:bg-purple-500"
              }`}
              onClick={() =>
                insertMention(
                  user.username,
                  activeField === "title" ? setTitle : setContent
                )
              }
            >
              @{user.username}
            </button>
          ))}
        </div>
      )}
      {/* Bouton pour remonter en haut de la page */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-6 right-6 p-3 bg-purple-700 text-white rounded-full shadow-lg hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 z-50"
          onClick={scrollToTop}
          title="Remonter en haut"
        >
          <ChevronUp className="h-6 w-6" />
        </motion.button>
      )}
    </main>
  );
}

export default PublicationPage;
