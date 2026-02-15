import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/icon-192.svg",
        "icons/icon-512.svg",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-maskable-512.png",
        "icons/apple-touch-icon-180.png",
        "icons/favicon-32.png",
        "icons/favicon-16.png",
        "social/share-card-1200x630.png"
      ],
      manifest: {
        name: "Drop-a-Block",
        short_name: "DropBlock",
        description:
          "Drop-a-Block is a mobile-first arcade puzzle game with touch controls and quick sessions.",
        theme_color: "#0b1020",
        background_color: "#0b1020",
        start_url: `${basePath}?utm_source=homescreen`,
        scope: basePath,
        display: "standalone",
        display_override: ["standalone", "minimal-ui", "browser"],
        orientation: "portrait-primary",
        categories: ["games", "puzzle", "entertainment"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any"
          },
          {
            src: "icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          },
          {
            src: "icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml"
          }
        ],
        screenshots: [
          {
            src: "social/share-card-1200x630.png",
            sizes: "1200x630",
            type: "image/png",
            form_factor: "wide",
            label: "Drop-a-Block gameplay preview"
          }
        ],
        shortcuts: [
          {
            name: "Play Now",
            short_name: "Play",
            url: `${basePath}?launch=play&utm_source=shortcut_play`,
            description: "Jump into Drop-a-Block."
          },
          {
            name: "Leaderboard",
            short_name: "Scores",
            url: `${basePath}?launch=scores&utm_source=shortcut_scores`,
            description: "Open and chase high scores."
          }
        ]
      }
    })
  ]
});
