import { MutationResolvers } from "../../types";

export const updateArticle: NonNullable<
  MutationResolvers["updateArticle"]
> = async (
  _,
  { id, title, content, imageUrl },
  { dataSources: { db }, user }
) => {
  try {
    if (!user) {
      return {
        code: 403,
        success: false,
        message: `Unauthorized`,
      };
    }

    const existArticle = await db.article.findFirst({ where: { id } });
    if (!existArticle) {
      return {
        code: 404,
        success: false,
        message: `Article not found`,
      };
    }

    if (user.id !== existArticle.authorId) {
      return {
        code: 401,
        success: false,
        message: `You are not the author of this article`,
      };
    }

    const updateData: {
      title?: string;
      content?: string;
      imageUrl?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (title !== null) {
      updateData.title = title;
    }
    if (content !== null) {
      updateData.content = content;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    console.log("Mise à jour de l'article avec les données:", updateData);

    await db.article.update({
      where: {
        id,
      },
      data: updateData,
    });

    return {
      code: 200,
      success: true,
      message: `Article has been updated`,
    };
  } catch (error) {
    console.error("Error updating article:", error);
    return {
      code: 400,
      message: "Article has not been updated",
      success: false,
    };
  }
};
