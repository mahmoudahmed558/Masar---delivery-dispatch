import { useEffect } from 'react';

export default function useSEO({ title, description }) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = `${title} | مسار دسباتش`;
    } else {
      document.title = 'مسار | مكتب دسباتش وتوصيل';
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
      
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);
}
