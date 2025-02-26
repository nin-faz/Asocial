export type ArticleDislikeModel = {
    id: string;
    articleId: string;
    userId: string;
    createdAt: Date;
};

export type CommentDislikeModel = {
    id: string;
    commentId: string;
    userId: string;
    createdAt: Date;
};