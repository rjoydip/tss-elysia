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
            if (id.includes("@tanstack/react-router")) {
              return "vendor-router";
            }
            if (id.includes("@tanstack/react-start")) {
              return "vendor-start";
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            if (id.includes("react") && !id.includes("@radix")) {
              return "vendor-react";
            }
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (
              id.includes("class-variance-authority") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge")
            ) {
              return "vendor-utils";
            }
            if (id.includes("shiki")) {
              return "vendor-shiki";
            }
            if (id.includes("react-markdown") || id.includes("remark-") || id.includes("rehype-")) {
              return "vendor-markdown";
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
            if (id.includes("shadcn") || id.includes("cmdk") || id.includes("embla")) {
              return "vendor-ui";
            }
            if (id.includes("@opentelemetry")) {
              return "vendor-telemetry";
            }
            if (id.includes("@tanstack/router-devtools")) {
              return "vendor-devtools";
            }
            return "vendor-misc";
          }
        },
        chunkFileNames: "chunks/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));