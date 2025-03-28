import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  ADD_ARTICLE_DISLIKE,
  DELETE_ARTICLE_DISLIKE,
  ADD_COMMENT_DISLIKE,
  DELETE_COMMENT_DISLIKE,
} from "../mutations";
import {
  FIND_DISLIKES_BY_USER_ID_FOR_ARTICLE,
  FIND_DISLIKES_BY_USER_ID_FOR_COMMENT,
} from "../queries";
import { showLoginRequiredToast } from "../utils/customToasts";

interface UseDislikeParams {
  user: { id: string; username: string } | null;
  items: { id: string; dislikes?: { user?: { id: string } }[] }[];
  refetchItems: () => Promise<any>;
  type?: "article" | "comment";
}

export const useDislike = ({
  user,
  items,
  refetchItems,
  type = "article",
}: UseDislikeParams) => {
  const { data: dislikeUser, refetch: refetchDislikeUser } = useQuery(
    type === "article"
      ? FIND_DISLIKES_BY_USER_ID_FOR_ARTICLE
      : FIND_DISLIKES_BY_USER_ID_FOR_COMMENT,
    {
      variables: { userId: user?.id! },
      skip: !user?.id,
    }
  );

  const [userDislikes, setUserDislikes] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    if (!user) {
      setUserDislikes({});
      return;
    }

    const dislikesMap: { [key: string]: boolean } = {};

    items.forEach(({ id, dislikes = [] }) => {
      if (dislikes.some((d) => d?.user?.id === user.id)) {
        dislikesMap[id] = true;
      }
    });

    if (dislikeUser?.getDislikesByUserId) {
      dislikeUser.getDislikesByUserId.forEach((dislike) => {
        if (
          (type === "article" && dislike?.article) ||
          (type === "comment" && dislike?.comment)
        ) {
          const item = type === "article" ? dislike.article : dislike.comment;
          if (item) dislikesMap[item.id] = true;
        }
      });
    }

    setUserDislikes((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(dislikesMap)) {
        return dislikesMap;
      }
      return prev;
    });
  }, [items, dislikeUser, user?.id]);

  const [addDislike] = useMutation(
    type === "article" ? ADD_ARTICLE_DISLIKE : ADD_COMMENT_DISLIKE
  );
  const [deleteDislike] = useMutation(
    type === "article" ? DELETE_ARTICLE_DISLIKE : DELETE_COMMENT_DISLIKE
  );

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
      setUserDislikes((prev) => ({
        ...prev,
        [articleId]: !prev[articleId],
      }));

      if (userDislikes[articleId]) {
        await deleteDislike({
          variables: {
            [type === "article" ? "articleId" : "commentId"]: articleId,
            userId: user.id,
            articleId: "",
          },
        });
        setUserDislikes((prev) => ({ ...prev, [articleId]: false }));
        console.log(user.username, "a retiré son dislike.");
      } else {
        await addDislike({
          variables: {
            [type === "article" ? "articleId" : "commentId"]: articleId,
            userId: user.id!,
            articleId: "",
          },
        });
        setUserDislikes((prev) => ({ ...prev, [articleId]: true }));
        console.log(user.username, "a disliké l'article.");
      }

      await refetchDislikeUser();
      await refetchItems();
    } catch (error) {
      console.error("Erreur lors de l'ajout/suppression du dislike :", error);
    }
  };

  return { userDislikes, handleDislike };
};
