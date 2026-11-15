/**
 * GitHub Pages has no SPA rewrites, so after `vite build`:
 * - copy dist/index.html to dist/<route>.html for every static route in
 *   the sitemap, so those URLs return HTTP 200 (important for crawlers);
 * - copy dist/index.html to dist/404.html so dynamic routes (e.g. /profile/:id)
 *   still load the app, albeit with a 404 status.
 */

import { copyFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const indexHtml = join(dist, 'index.html');

const sitemap = readFileSync(join(root, 'public', 'sitemap.xml'), 'utf8');
const routes = [...sitemap.matchAll(/<loc>https?:\/\/[^/<]+(\/[^<]*)<\/loc>/g)]
  .map(([, path]) => path)
  .filter((path) => path !== '/' && !path.startsWith('/profile/'));

// Write <route>.html rather than <route>/index.html: GitHub Pages serves
// /about from about.html with a 200, whereas a directory index triggers a
// 301 redirect to /about/ (trailing slash), which doesn't match our URLs.
for (const route of routes) {
  const file = join(dist, `${route}.html`);
  mkdirSync(dirname(file), { recursive: true });
  copyFileSync(indexHtml, file);
}

copyFileSync(indexHtml, join(dist, '404.html'));

console.log(`✅ SPA fallback: ${routes.length} route pages + 404.html`);
