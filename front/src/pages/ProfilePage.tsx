import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  ThumbsDown,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  Skull,
  Link as LinkIcon,
  Save,
  X,
  Share2,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { UPDATE_USER } from "../mutations";
import { useNavigate } from "react-router-dom";
import {
  FIND_ARTICLES,
  GET_USER_BY_ID,
  FIND_DISLIKES_BY_USER_ID_FOR_ARTICLE,
  FIND_ARTICLES_BY_USER,
} from "../queries";
import { Article, UserSummary, Dislike } from "../gql/graphql";

const ProfilePage = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [numberOfPosts, setNumberOfPosts] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [allArticleDisliked, setAllArticleDisliked] = useState<
    Article[] | null
  >([]);
  const [numberOfPostDisliked, setNumberOfPostDisliked] = useState(0);
  const [activeTab, setActiveTab] = useState("publications"); // State for active tab

  if (!auth) return null;

  const { token, user, logout } = auth;

  useEffect(() => {
    if (!token || !user) {
      console.warn("Utilisateur déconnecté, redirection...");
      navigate("/");
    }
  }, [token, user, navigate]);

  const { data: userInfos, refetch: refetchUserInfos } = useQuery(
    GET_USER_BY_ID,
    {
      variables: { id: user?.id },
      skip: !user,
    }
  );

  const userInfosData = userInfos?.findUserById;

  // const article = useQuery<{ findArticles: Article[] }>(FIND_ARTICLES);
  const { data: articleDisliked, refetch: refetchArticleDisliked } = useQuery(
    FIND_DISLIKES_BY_USER_ID_FOR_ARTICLE,
    {
      variables: { userId: user?.id! },
    }
  );

  const dislikesByUser = articleDisliked?.getDislikesByUserId;
  console.log("Article liké : ", dislikesByUser);

  // useEffect(() => {
  //   setNumberOfPosts(0);
  //   if (article.data && user) {
  //     const userArticles = article.data.findArticles.filter(
  //       (article) => article.author.id === user.id
  //     );
  //     console.log("userArticles : ", userArticles);
  //     setArticles(userArticles);
  //     setNumberOfPosts(userArticles.length);
  //   }
  // }, [article.data, user]);

  useEffect(() => {
    if (dislikesByUser && user) {
      setNumberOfPostDisliked(dislikesByUser.length);
      setAllArticleDisliked(
        dislikesByUser
          .map((dislike) => dislike?.article)
          .filter((article): article is Article => article !== null)
      );
    }
  }, [dislikesByUser, user]);

  const [updateUserMutation, { loading: updating }] = useMutation(UPDATE_USER);

  useEffect(() => {
    if (userInfosData) {
      setUsername(userInfosData.username);
      setBio(userInfosData.bio);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveProfile = async () => {
    try {
      const { data } = await updateUserMutation({
        variables: {
          id: user?.id,
          body: {
            username,
            bio,
          },
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (data.updateUser.success) {
        setIsEditing(false);
        setError("");
      } else {
        setError(data.updateUser.message);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la mise à jour du profil.");
      console.error(error, err);
    }
  };

  const cancelEditing = () => {
    // Reset form to original values
    if (user) {
      setUsername(userInfosData.username);
      setBio(userInfosData.bio);
    }
    setIsEditing(false);
    setError("");
  };

  // Mock stats for UI
  const mockUserStats = {
    publications: 10,
    dislikes: 5,
    followers: 20,
    following: 15,
  };

  const { data: articleByUser, refetch: refetchArticleByUser } = useQuery(
    FIND_ARTICLES_BY_USER,
    {
      variables: { userId: user?.id! },
      skip: !user,
    }
  );

  const articleByUserData = articleByUser?.findArticlesByUser;

  console.log("actives", activeTab);

  articleByUserData?.map((article) => {
    console.log("ici", article.dislikes); // Vérifie si "dislikes" existe bien pour chaque article
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-lg p-6 border border-purple-900"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 rounded-full bg-purple-900 flex items-center justify-center"
          >
            <Skull className="h-16 w-16 text-purple-400" />
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Nom d'utilisateur
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-800 text-gray-100 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-400 mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 text-gray-100 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {error && <div className="text-red-400 text-sm">{error}</div>}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelEditing}
                    className="flex items-center px-3 py-1 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </button>

                  <button
                    onClick={handleSaveProfile}
                    disabled={updating}
                    className={`flex items-center px-3 py-1 ${
                      updating
                        ? "bg-purple-800"
                        : "bg-purple-600 hover:bg-purple-700"
                    } text-white rounded-lg`}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {updating ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-purple-400 mb-2">
                  {user?.username}
                </h1>
                <p className="text-gray-500 mb-4">
                  Membre depuis{" "}
                  {new Date(
                    userInfosData?.createdAt || Date.now()
                  ).toLocaleDateString("fr-FR", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-gray-300 mb-6 max-w-2xl">
                  {userInfosData?.bio || "Bienvenue sur mon profil !"}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400">
                  <button className="flex items-center space-x-2 hover:text-purple-400">
                    <MessageSquare className="h-5 w-5" />
                    <span>
                      {articleByUser?.findArticlesByUser.length} publications
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5" />
                    <span>{numberOfPostDisliked} dislikes reçus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>
                      {mockUserStats.followers} détracteurs ·{" "}
                      {mockUserStats.following} cibles
                    </span>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Modifier le profil
                </motion.button>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex md:flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Settings className="h-6 w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg"
            >
              <LinkIcon className="h-6 w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"
              onClick={handleLogout}
            >
              <LogOut className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-8 border-b border-purple-900">
        <nav className="flex gap-8">
          <button
            className={`pb-4 ${
              activeTab === "publications"
                ? "text-purple-400 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("publications")}
          >
            Publications
          </button>
          <button
            className={`pb-4 ${
              activeTab === "dislikes"
                ? "text-purple-400 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("dislikes")}
          >
            Dislikes
          </button>
          <button
            className={`pb-4 ${
              activeTab === "reponses"
                ? "text-purple-400 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("reponses")}
          >
            Réponses
          </button>
          <button
            className={`pb-4 ${
              activeTab === "medias"
                ? "text-purple-400 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("medias")}
          >
            Médias
          </button>
        </nav>
      </div>

      {/* Feed */}
      <div className="mt-8 space-y-6">
        {activeTab === "publications" && (
          <div className="space-y-6 mt-4">
            {articleByUserData && articleByUserData.length > 0 ? (
              articleByUserData.map((article) => (
                // <motion.div
                //   key={article.id}
                //   initial={{ opacity: 0, y: 20 }}
                //   animate={{ opacity: 1, y: 0 }}
                //   transition={{ delay: 0.1, duration: 0.5 }}
                //   whileHover={{
                //     scale: 1.05,
                //     boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
                //     transition: {
                //       duration: 0.2,
                //       ease: "easeOut",
                //     },
                //   }}
                //   whileTap={{ scale: 0.98 }}
                //   className="bg-gray-900 rounded-lg p-6 border border-purple-900 cursor-pointer hover:border-purple-700 transition-colors"
                // >
                <div className="p-4 bg-gray-900 rounded-lg border border-purple-900">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                      <Skull className="h-6 w-6 text-purple-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      Publié le {""}
                      {article.updatedAt
                        ? new Date(parseInt(article.updatedAt, 10))
                            .toLocaleString()
                            .replace(" ", " à ")
                        : new Date(parseInt(article.createdAt ?? "0", 10))
                            .toLocaleString()
                            .replace(" ", " à ")}
                    </p>
                  </div>
                  <div className="py-2">
                    <h2 className="text-xl font-semibold text-purple-400 mb-2">
                      {article.title}
                    </h2>
                    <p className="text-gray-300 text-lg mb-6 whitespace-pre-wrap">
                      {article.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-gray-500 border-t border-gray-800 pt-4">
                    <div className="flex items-center space-x-6 text-gray-500">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 hover:text-purple-400"
                      >
                        <ThumbsDown className="h-5 w-5" />
                        <span>{article.TotalDislikes}</span>
                      </motion.button>
                      <button className="flex items-center gap-2 hover:text-purple-400">
                        <MessageSquare className="h-5 w-5" />
                        <span>{article.TotalComments}</span>
                      </button>
                    </div>

                    <button className="flex items-center space-x-2 hover:text-purple-400">
                      <Share2 className="h-5 w-5" />
                      <span>Partager</span>
                    </button>
                  </div>
                  {/* </motion.div> */}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Aucune publication trouvée.</p>
            )}
          </div>
        )}

        {/* Onglet Dislikes */}
        {activeTab === "dislikes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {dislikesByUser && dislikesByUser.length > 0 ? (
              dislikesByUser
                .filter((dislike) => dislike?.article)
                .map((dislike) => (
                  <motion.div
                    key={dislike?.article?.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0px 0px 15px rgba(128, 0, 128, 0.7)",
                      transition: {
                        duration: 0.2,
                        ease: "easeOut",
                      },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-900 rounded-lg p-6 border border-purple-900 hover:border-purple-700 transition-colors flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                          <Skull className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-purple-400 font-semibold">
                            {dislike?.article?.author.username}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            Le{" "}
                            {new Date(
                              parseInt(dislike?.article?.createdAt!, 10)
                            )
                              .toLocaleString()
                              .replace(" ", " à ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col flex-grow justify-between">
                      <h1 className="text-2xl font-semibold text-gray-100 h-8 mb-4">
                        {dislike?.article?.title}
                      </h1>

                      <p className="text-gray-300 mb-4 whitespace-pre-wrap flex-grow">
                        {dislike?.article?.content}
                      </p>

                      <div className="flex flex-col justify-center items-end text-gray-500">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-end space-x-2 text-purple-400"
                        >
                          <ThumbsDown className="h-5 w-5" />
                          <span>Disliké</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
            ) : (
              <p className="text-gray-500">Aucun article disliké.</p>
            )}
          </div>
        )}

        {/* Example Post */}
        {/* {activeTab === "dislikes" && articleDisliked
          ? articleDisliked.map((article) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-lg p-6 border border-purple-900"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <Skull className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400 font-semibold">
                        {user?.username}
                      </span>
                      <span className="text-gray-500">
                        ·{" "}
                        {article.updatedAt
                          ? new Date(
                              parseInt(article.updatedAt ?? "0", 10)
                            ).toLocaleString()
                          : new Date(
                              parseInt(article.createdAt ?? "0", 10)
                            ).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{article.content}</p>
                    <div className="flex items-center gap-6 text-gray-500">
                      <button className="flex items-center gap-2 hover:text-purple-400">
                        <ThumbsDown className="h-5 w-5" />
                        <span>1.3K</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-purple-400">
                        <MessageSquare className="h-5 w-5" />
                        <span>42</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          : null} */}
        {/* {activeTab === "publications" &&
          articles.map((article) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-lg p-6 border border-purple-900"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <Skull className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-purple-400 font-semibold">
                      {user?.username}
                    </span>
                    <span className="text-gray-500">
                      ·{" "}
                      {article.updatedAt
                        ? new Date(
                            parseInt(article.updatedAt ?? "0", 10)
                          ).toLocaleString()
                        : new Date(
                            parseInt(article.createdAt ?? "0", 10)
                          ).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{article.content}</p>
                  <div className="flex items-center gap-6 text-gray-500">
                    <button className="flex items-center gap-2 hover:text-purple-400">
                      <ThumbsDown className="h-5 w-5" />
                      <span>1.3K</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-purple-400">
                      <MessageSquare className="h-5 w-5" />
                      <span>42</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))} */}
      </div>
    </main>
  );
};

export default ProfilePage;
