import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("ts-node").register({
  esm: true,
  experimentalSpecifierResolution: "node",
  transpileOnly: true,
  compilerOptions: {
    module: "ESNext",
    moduleResolution: "NodeNext",
    allowJs: true,
    resolveJsonModule: true,
    target: "ES2022",
    paths: {
      "*": ["./node_modules/*", "./src/*"],
    },
  },
});
