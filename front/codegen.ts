import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4000",
  documents: [
    "src/queries/articleQuery.ts",
    "src/mutations/articleMutation.ts",
    // "src/pages/PublicationPage.tsx",
    "src/queries/dislikeQuery.ts",
    "src/mutations/dislikeMutation.ts",
  ],
  generates: {
    "src/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
