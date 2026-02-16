import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const baseUrl = "https://roast-timer.com";
    const urls: SitemapUrl[] = [];

    // Add static routes
    urls.push({
      loc: `${baseUrl}/`,
      changefreq: 'daily',
      priority: 1.0
    });

    urls.push({
      loc: `${baseUrl}/roast`,
      changefreq: 'weekly',
      priority: 0.9
    });

    urls.push({
      loc: `${baseUrl}/discover`,
      changefreq: 'daily',
      priority: 0.8
    });

    urls.push({
      loc: `${baseUrl}/how-to`,
      changefreq: 'monthly',
      priority: 0.8
    });

    urls.push({
      loc: `${baseUrl}/about`,
      changefreq: 'monthly',
      priority: 0.7
    });

    // How-To Guide Pages
    urls.push({
      loc: `${baseUrl}/how-to/getting-started`,
      changefreq: 'monthly',
      priority: 0.7
    });

    urls.push({
      loc: `${baseUrl}/how-to/using-profiles`,
      changefreq: 'monthly',
      priority: 0.7
    });

    urls.push({
      loc: `${baseUrl}/how-to/cupping-notes`,
      changefreq: 'monthly',
      priority: 0.7
    });

    urls.push({
      loc: `${baseUrl}/how-to/development-ratios`,
      changefreq: 'monthly',
      priority: 0.7
    });

    // Roaster-Specific Guides
    urls.push({
      loc: `${baseUrl}/how-to/roasters/gene-cafe-cbr-101`,
      changefreq: 'monthly',
      priority: 0.6
    });

    urls.push({
      loc: `${baseUrl}/how-to/roasters/behmor-2000ab`,
      changefreq: 'monthly',
      priority: 0.6
    });

    urls.push({
      loc: `${baseUrl}/how-to/roasters/freshroast-sr800`,
      changefreq: 'monthly',
      priority: 0.6
    });

    urls.push({
      loc: `${baseUrl}/how-to/roasters/kaldi-wide`,
      changefreq: 'monthly',
      priority: 0.6
    });

    urls.push({
      loc: `${baseUrl}/how-to/roasters/hottop-kn-8828`,
      changefreq: 'monthly',
      priority: 0.6
    });

    urls.push({
      loc: `${baseUrl}/how-to/roasters/popcorn-popper`,
      changefreq: 'monthly',
      priority: 0.6
    });

    // Fetch all public roast profiles
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

    console.log(`Generated sitemap with ${urls.length} URLs`);

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ''}${url.changefreq ? `
    <changefreq>${url.changefreq}</changefreq>` : ''}${url.priority !== undefined ? `
    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', {
      status: 500,
      headers: corsHeaders,
    });
  }
});
