/**
 * Sitemap Generator for Coffee Roast Timer
 * 
 * Generates a static sitemap.xml file with all public routes and profile URLs.
 * 
 * Features:
 * - Fetches all roast profiles from Supabase
 * - Includes static pages (landing, roast, discover, how-to guides)
 * - Adds lastmod dates for dynamic profile URLs
 * - Gracefully degrades to static-only if database is unavailable
 * 
 * Usage:
 *   npm run sitemap          - Manual generation
 *   npm run build            - Automatically runs before build
 * 
 * Requirements:
 *   Environment variables in .env:
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY
 * 
 * Output:
 *   public/sitemap.xml (copied to dist/ during build)
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

const BASE_URL = 'https://roast-timer.com';

// Static routes with their priorities and change frequencies
const staticRoutes = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/roast', changefreq: 'weekly', priority: 0.9 },
  { loc: '/discover', changefreq: 'daily', priority: 0.8 },
  { loc: '/how-to', changefreq: 'monthly', priority: 0.8 },
  { loc: '/about', changefreq: 'monthly', priority: 0.7 },
  
  // How-To Guide Pages
  { loc: '/how-to/getting-started', changefreq: 'monthly', priority: 0.7 },
  { loc: '/how-to/using-profiles', changefreq: 'monthly', priority: 0.7 },
  { loc: '/how-to/cupping-notes', changefreq: 'monthly', priority: 0.7 },
  { loc: '/how-to/development-ratios', changefreq: 'monthly', priority: 0.7 },
  { loc: '/how-to/first-crack-timing', changefreq: 'monthly', priority: 0.7 },
  { loc: '/how-to/roast-defects', changefreq: 'monthly', priority: 0.7 },
  { loc: '/how-to/behmor-2000ab-troubleshooting', changefreq: 'monthly', priority: 0.7 },
  { loc: '/how-to/popcorn-popper-safety', changefreq: 'monthly', priority: 0.7 },
  { loc: '/how-to/roast-numbers', changefreq: 'monthly', priority: 0.7 },
  
  // Roaster-Specific Guides
  { loc: '/how-to/roasters/gene-cafe-cbr-101', changefreq: 'monthly', priority: 0.6 },
  { loc: '/how-to/roasters/behmor-2000ab', changefreq: 'monthly', priority: 0.6 },
  { loc: '/how-to/roasters/freshroast-sr800', changefreq: 'monthly', priority: 0.6 },
  { loc: '/how-to/roasters/kaldi-wide', changefreq: 'monthly', priority: 0.6 },
  { loc: '/how-to/roasters/hottop-kn-8828', changefreq: 'monthly', priority: 0.6 },
  { loc: '/how-to/roasters/popcorn-popper', changefreq: 'monthly', priority: 0.6 },
];

function generateSitemapXML(urls) {
  const urlEntries = urls.map(url => {
    let entry = `  <url>\n    <loc>${BASE_URL}${url.loc}</loc>`;
    
    if (url.lastmod) {
      entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority !== undefined) {
      entry += `\n    <priority>${url.priority}</priority>`;
    }
    
    entry += `\n  </url>`;
    return entry;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

async function fetchPublicProfiles() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not found in .env file');
    console.warn('   Generating sitemap with static routes only');
    return [];
  }

  try {
    console.log('📡 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Only public roasts: private and link-only roasts stay out of search engines.
    const query = (publicOnly) => {
      const q = supabase.from('roast_profiles').select('id, updated_at');
      return (publicOnly ? q.eq('visibility', 'public') : q).order('created_at', { ascending: false });
    };
    let { data: profiles, error } = await query(true);
    if (error && (error.code === '42703' || error.code === 'PGRST204') && /visibility/i.test(error.message ?? '')) {
      // Before the visibility migration every roast is public.
      console.warn('⚠️  roast_profiles.visibility does not exist yet; listing every roast');
      ({ data: profiles, error } = await query(false));
    }

    if (error) {
      console.error('❌ Error fetching profiles:', error.message);
      console.warn('   Generating sitemap with static routes only');
      return [];
    }

    console.log(`✅ Fetched ${profiles?.length || 0} public profiles`);
    return profiles || [];
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
    console.warn('   Generating sitemap with static routes only');
    return [];
  }
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...\n');

  // Start with static routes
  const urls = [...staticRoutes];

  // Fetch and add dynamic profile routes
  const profiles = await fetchPublicProfiles();
  
  profiles.forEach(profile => {
    urls.push({
      loc: `/profile/${profile.id}`,
      lastmod: new Date(profile.updated_at).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.6
    });
  });

  // Generate XML
  const xml = generateSitemapXML(urls);

  // Write to public directory
  const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
  writeFileSync(outputPath, xml, 'utf8');

  console.log(`\n✅ Sitemap generated successfully!`);
  console.log(`   Location: public/sitemap.xml`);
  console.log(`   Total URLs: ${urls.length}`);
  console.log(`   - Static routes: ${staticRoutes.length}`);
  console.log(`   - Profile routes: ${profiles.length}`);
}

// Run the generator
generateSitemap().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
