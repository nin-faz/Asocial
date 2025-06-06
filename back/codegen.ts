import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schema.ts",
  generates: {
    "./src/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "./context#Context",
        mappers: {
          User: "./model#UserModel",
          Article: "./model#ArticleModel",
          Dislike: "./model#DislikeModel",
          Comment: "./model#CommentModel",
          PasswordResetRequest: "./model#PasswordResetRequestModel",
        },
      },
    },
  },
};

export default config;
