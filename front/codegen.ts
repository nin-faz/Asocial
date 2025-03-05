import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4000",
  documents: [
    "src/queries/articleQuery.ts",
    // "src/pages/PublicationPage.tsx",
    "src/mutations/articleMutation.ts",
  ],
  generates: {
    "src/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
