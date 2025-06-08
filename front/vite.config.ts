import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Si je veux tester en local sur mon téléphone
  // server: {
  //   allowedHosts: ["f554-89-2-117-106.ngrok-free.app", "all"],
  // },
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
