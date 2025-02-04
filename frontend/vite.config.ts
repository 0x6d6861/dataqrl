import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      "/api/upload": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/api/events": {
        target: "http://localhost:3002",
        changeOrigin: true,
        secure: false,
      }
    },
  },
});
