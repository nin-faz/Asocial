// pas utilisé peut être plus tard

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { ADD_ARTICLE_DISLIKE, DELETE_ARTICLE_DISLIKE } from "../mutations";
import {
  FIND_DISLIKES_BY_USER_ID_FOR_ARTICLE,
  FIND_DISLIKES_BY_USER_ID_FOR_COMMENT,
} from "../queries";

interface UseDislikeParams {
  user: { id: string; username: string } | null;
  items: { id: string; dislikes?: { user?: { id: string } }[] }[];
  refetchItems?: () => void;
  isNotLogin?: (action: "dislike" | "publish") => void;
}

export const useDislike = ({
  user,
  items,
  refetchItems,
  isNotLogin,
}: UseDislikeParams) => {
  const { data: dislikeUser, refetch: refetchDislikeUser } = useQuery(
    FIND_DISLIKES_BY_USER_ID_FOR_ARTICLE,
    {
      variables: { userId: user?.id! },
      skip: !user?.id,
    }
  );

  const [userDislikes, setUserDislikes] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Met à jour userDislikes selon les items (articles ou commentaires) et les dislikes
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
        if (dislike?.item) {
          dislikesMap[dislike.item.id] = true;
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
      await refetchItems?.();
    } catch (err) {
      console.error("Erreur dislike :", err);
    }
  };

  return { userDislikes, handleDislike };
};
