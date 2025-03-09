import { GET_USER_BY_ID, GET_USER_BY_TOKEN } from "./userQueries";
import {
  FIND_ARTICLES,
  FIND_ARTICLE_BY_ID,
  FIND_ARTICLE_BY_MOST_DISLIKED,
} from "./articleQuery";
import { FIND_DISLIKES_BY_USER_ID } from "./dislikeQuery";
import { GET_COMMENTS } from "./commentQuery";

export {
  GET_USER_BY_TOKEN,
  GET_USER_BY_ID,
  FIND_ARTICLES,
  FIND_DISLIKES_BY_USER_ID,
  FIND_ARTICLE_BY_ID,
  FIND_ARTICLE_BY_MOST_DISLIKED,
  GET_COMMENTS,
};
