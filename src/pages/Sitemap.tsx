import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    const fetchAndServeSitemap = async () => {
      try {
        const response = await fetch('https://iimoeootixsvkkhqfrhi.supabase.co/functions/v1/sitemap');
        const xml = await response.text();
        
        // Replace the current page with the XML content
        document.open();
        document.write(xml);
        document.close();
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        document.open();
        document.write('Error loading sitemap');
        document.close();
      }
    };
    
    fetchAndServeSitemap();
  }, []);

  return null;
};

export default Sitemap;
