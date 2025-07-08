import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";

// https://vite.dev/config/
// Dans fazer>ngrok2>ngrok.exe, lancer : .\ngrok.exe start --all --config ngrok.yml

export default defineConfig({
  // Si je veux tester en local sur mon téléphone
  // server: {
  //   allowedHosts: ["6d3a1e50a870.ngrok-free.app", "all"],
  // },
  plugins: [react(), compression()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    minify: "esbuild",
    sourcemap: false,
    cssMinify: true,
  },
});
