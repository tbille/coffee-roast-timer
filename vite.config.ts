import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { renderLlmsTxt, renderSiteJsonLd, renderStaticShell } from "./src/content/staticShell.ts";

/**
 * Injects crawler-readable HTML + JSON-LD into index.html and serves /llms.txt,
 * all generated from src/content/siteContent.ts.
 */
const seoShell = (): Plugin => ({
  name: "seo-static-shell",
  transformIndexHtml(html) {
    return html
      .replace("<!--seo:json-ld-->", renderSiteJsonLd())
      .replace("<!--seo:static-shell-->", renderStaticShell());
  },
  configureServer(server) {
    server.middlewares.use("/llms.txt", (_req, res) => {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(renderLlmsTxt());
    });
  },
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "llms.txt", source: renderLlmsTxt() });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2018",
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    tailwindcss(),
    seoShell(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
