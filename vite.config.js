import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // المسار الذي تريد تحويله
        target: "https://api.football-data.org/v4", // عنوان URL الأساسي للـ API
        changeOrigin: true, // تغيير الأصل لتجنب مشاكل CORS
        rewrite: (path) => path.replace(/^\/api/, ""), // إزالة /api من المسار
        headers: {
          "X-Auth-Token": "6a31cc8761ba4eaa84e25bc8c960a181", // مفتاح API الخاص بك
        },
      },
    },
  },
});