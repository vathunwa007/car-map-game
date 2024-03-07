import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,glb}"],
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 314572800, // 3MB
      },
      includeAssets: ["**/*"],
    }),
    viteStaticCopy({
      silent: true,
      structured: true,
      targets: [
        {
          src: path.resolve(__dirname, "./src/jsm") + "/[!.]*", // 1️⃣
          dest: "./src/jsm",
        },
      ],
    }),
  ],
  assetsInclude: ["**/*.{gltf,glb}"],
  build: {
    target: "ES2022", // <--------- ✅✅✅✅✅✅
  },
});
