import { supabase } from "@/integrations/supabase/client";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export async function generateSitemap(): Promise<string> {
  const baseUrl = window.location.origin;
  const urls: SitemapUrl[] = [];

  // Add static routes
  urls.push({
    loc: `${baseUrl}/`,
    changefreq: 'daily',
    priority: 1.0
  });

  urls.push({
    loc: `${baseUrl}/discover`,
    changefreq: 'daily',
    priority: 0.8
  });

  urls.push({
    loc: `${baseUrl}/about`,
    changefreq: 'monthly',
    priority: 0.7
  });

  // Fetch all public roast profiles
  try {
    const { data: profiles, error } = await supabase
      .from('roast_profiles')
      .select('id, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching roast profiles for sitemap:', error);
    } else if (profiles) {
      profiles.forEach(profile => {
        urls.push({
          loc: `${baseUrl}/profile/${profile.id}`,
          lastmod: new Date(profile.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.6
        });
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

export async function downloadSitemap() {
  const xml = await generateSitemap();
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  a.click();
  URL.revokeObjectURL(url);
}