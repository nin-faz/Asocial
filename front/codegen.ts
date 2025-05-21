import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://back-asocial.onrender.com",
  // schema: "http://localhost:4000",
  // schema: "https://asocial-production.up.railway.app",

  documents: ["src/**/*.ts"],
  generates: {
    "src/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
