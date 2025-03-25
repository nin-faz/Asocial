// pas utilisé peut être plus tard

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { FIND_DISLIKES_BY_USER_ID } from "../queries";
import { ADD_ARTICLE_DISLIKE, DELETE_ARTICLE_DISLIKE } from "../mutations";

interface UseDislikeParams {
  user: { id: string; username: string } | null;
  articles: { id: string; dislikes?: { user?: { id: string } }[] }[];
  refetchArticles?: () => void;
  isNotLogin?: (action: "dislike" | "publish") => void;
}

export const useDislike = ({
  user,
  articles,
  refetchArticles,
  isNotLogin,
}: UseDislikeParams) => {
  const { data: dislikeUser, refetch: refetchDislikeUser } = useQuery(
    FIND_DISLIKES_BY_USER_ID,
    {
      variables: { userId: user?.id! },
      skip: !user?.id,
    }
  );

  const [userDislikes, setUserDislikes] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [sortOption, setSortOption] = useState("recent");

  // Met à jour userDislikes selon les articles et les dislikes
  useEffect(() => {
    if (!user) {
      setUserDislikes({});
      return;
    }

    const dislikesMap: { [key: string]: boolean } = {};

    articles.forEach(({ id, dislikes = [] }) => {
      if (dislikes.some((d) => d?.user?.id === user.id)) {
        dislikesMap[id] = true;
      }
    });

    if (dislikeUser?.getDislikesByUserId) {
      dislikeUser.getDislikesByUserId.forEach((dislike) => {
        if (dislike?.article) {
          dislikesMap[dislike.article.id] = true;
        }
      });
    }

    setUserDislikes((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(dislikesMap)) {
        return dislikesMap;
      }
      return prev;
    });
  }, [articles, dislikeUser, user?.id, sortOption]);

  const [addDislike] = useMutation(ADD_ARTICLE_DISLIKE);
  const [deleteDislike] = useMutation(DELETE_ARTICLE_DISLIKE);

  const handleDislike = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();

    if (!articleId) {
      console.error("ID article manquant !");
      return;
    }

    if (!user) {
      isNotLogin?.("dislike");
      return;
    }

    try {
      if (userDislikes[articleId]) {
        await deleteDislike({ variables: { articleId, userId: user.id } });
        setUserDislikes((prev) => ({ ...prev, [articleId]: false }));
      } else {
        await addDislike({ variables: { articleId, userId: user.id } });
        setUserDislikes((prev) => ({ ...prev, [articleId]: true }));
      }

      await refetchDislikeUser();
      await refetchArticles?.();
    } catch (err) {
      console.error("Erreur dislike :", err);
    }
  };

  return { userDislikes, handleDislike };
};
