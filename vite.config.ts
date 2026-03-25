import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

export default defineConfig({
  plugins: [tanstackStart(), viteReact(), tailwindcss()],
  environments: {
    ssr: { build: { rollupOptions: { input: "./src/server.ts" } } },
  },
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host,
    port,
  },
  preview: {
    host,
    port,
  },
});
