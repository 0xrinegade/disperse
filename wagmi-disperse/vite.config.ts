import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      gzipSize: true,
      template: "treemap",
      filename: "dist/stats.html",
    }),
  ],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 500,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "wagmi-vendor": ["wagmi", "viem"],
          "ui-vendor": ["@tanstack/react-query", "fuse.js"],
          chains: ["wagmi/chains"],
          // Split large wallet connectors into separate chunks
          "appkit-vendor": ["@reown/appkit"],
        },
      },
      // Enable tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
  },
  esbuild: {
    // Remove console logs in production during build
    drop: [],
  },
});
