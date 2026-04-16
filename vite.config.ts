import path from "path";
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
      "~": path.resolve(import.meta.dirname, "src"),
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
    allowedHosts: ["*.trycloudflare.com"],
  },
}));
