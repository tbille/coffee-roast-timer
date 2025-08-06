import { useEffect } from 'react';
import { generateSitemap } from '@/utils/generateSitemap';

const Sitemap = () => {
  useEffect(() => {
    const serveSitemap = async () => {
      try {
        const xml = await generateSitemap();
        
        // Set content type to XML
        const response = new Response(xml, {
          headers: {
            'Content-Type': 'application/xml',
          },
        });
        
        // Replace the current page with the XML content
        document.open();
        document.write(xml);
        document.close();
      } catch (error) {
        console.error('Error serving sitemap:', error);
        document.write('Error generating sitemap');
      }
    };
    
    serveSitemap();
  }, []);

  return null;
};

export default Sitemap;