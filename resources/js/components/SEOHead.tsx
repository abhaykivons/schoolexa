import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  children?: ReactNode;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * SEO Head Component
 * Use this component on each page for proper SEO meta tags and structured data
 * This helps Google understand your page content and structure
 */
export default function SEOHead({ 
  title, 
  description, 
  keywords,
  canonicalUrl,
  children,
  breadcrumbs 
}: SEOHeadProps) {
  // BreadcrumbList Schema for navigation structure
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  } : null;

  return (
    <Head title={title}>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph tags for social sharing */}
      <meta property="og:title" content={`${title} - SchoolExa`} />
      {description && <meta property="og:description" content={description} />}
      
      {/* Twitter Card */}
      <meta name="twitter:title" content={`${title} - SchoolExa`} />
      {description && <meta name="twitter:description" content={description} />}
      
      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      
      {children}
    </Head>
  );
}
