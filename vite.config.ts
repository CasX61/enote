import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @tauri-apps/cli setzt TAURI_DEV_HOST in manchen Setups; Standard ist localhost.
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Tauri erwartet einen festen Port und übernimmt die Konsole.
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? { protocol: "ws", host, port: 1421 }
      : undefined,
    watch: {
      // src-tauri nicht von Vite beobachten lassen.
      ignored: ["**/src-tauri/**"],
    },
  },

  // Tauri unterstützt moderne Targets; Quellmaps im Debug-Build.
  build: {
    target: "es2021",
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
