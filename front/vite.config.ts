import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";

// https://vite.dev/config/
export default defineConfig({
  // Si je veux tester en local sur mon téléphone
  // server: {
  //   allowedHosts: ["f554-89-2-117-106.ngrok-free.app", "all"],
  // },
  plugins: [react(), compression()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    minify: "esbuild",
    sourcemap: false,
    cssMinify: true, // Active la minification CSS (Vite >=5)
  },
});
