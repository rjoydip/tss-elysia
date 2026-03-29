import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

export default defineConfig(() => ({
  plugins: [tanstackStart(), viteReact(), tailwindcss()],
  ssr: {
    noExternal: ["drizzle-orm"],
  },
  environments: {
    ssr: {
      build: {
        rollupOptions: {
          input: "./src/server.ts",
          output: {
            entryFileNames: "server.js",
          },
        },
      },
    },
  },
  resolve: {
    alias: {
      "~": "/src",
    },
  },
  server: {
    host,
    port,
    envPrefix: ["VITE_", "PUBLIC_"],
  },
  preview: {
    host,
    port,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("better-auth")) {
              return "vendor-auth";
            }
            if (id.includes("@tanstack")) {
              return "vendor-router";
            }
            if (id.includes("react")) {
              return "vendor-react";
            }
            if (id.includes("drizzle")) {
              return "vendor-db";
            }
            if (id.includes("kysely")) {
              return "vendor-kysely";
            }
            if (id.includes("@libsql") || id.includes("bun:sqlite")) {
              return "vendor-sqlite";
            }
            return "vendor";
          }
        },
        chunkFileNames: "chunks/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));