<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate XML Sitemap for SEO
     * This helps Google discover and index all important pages
     */
    public function index(): Response
    {
        $baseUrl = config('app.url', 'https://schoolexa.com');
        
        // Define all public pages with their priorities and change frequencies
        $pages = [
            // Main pages (highest priority)
            [
                'loc' => $baseUrl,
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'weekly',
                'priority' => '1.0',
            ],
            [
                'loc' => $baseUrl . '/about',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => '0.9',
            ],
            [
                'loc' => $baseUrl . '/pricing',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'weekly',
                'priority' => '0.9',
            ],
            [
                'loc' => $baseUrl . '/careers',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ],
            [
                'loc' => $baseUrl . '/partners',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ],
            [
                'loc' => $baseUrl . '/docs',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ],
            [
                'loc' => $baseUrl . '/press-kit',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ],
            // Support pages
            [
                'loc' => $baseUrl . '/help-center',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ],
            [
                'loc' => $baseUrl . '/contact',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ],
            [
                'loc' => $baseUrl . '/status',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'daily',
                'priority' => '0.7',
            ],
            [
                'loc' => $baseUrl . '/security',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ],
            // SEO Landing Pages (high priority for marketing)
            [
                'loc' => $baseUrl . '/school-management-software',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'weekly',
                'priority' => '0.9',
            ],
            [
                'loc' => $baseUrl . '/edtech-school-management',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'weekly',
                'priority' => '0.9',
            ],
            [
                'loc' => $baseUrl . '/student-information-system',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'weekly',
                'priority' => '0.9',
            ],
            // Legal pages (lower priority but important for trust)
            [
                'loc' => $baseUrl . '/privacy-policy',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'yearly',
                'priority' => '0.5',
            ],
            [
                'loc' => $baseUrl . '/terms-of-service',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'yearly',
                'priority' => '0.5',
            ],
            [
                'loc' => $baseUrl . '/cookie-policy',
                'lastmod' => now()->toW3cString(),
                'changefreq' => 'yearly',
                'priority' => '0.4',
            ],
        ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

        foreach ($pages as $page) {
            $xml .= '  <url>' . PHP_EOL;
            $xml .= '    <loc>' . htmlspecialchars($page['loc']) . '</loc>' . PHP_EOL;
            $xml .= '    <lastmod>' . $page['lastmod'] . '</lastmod>' . PHP_EOL;
            $xml .= '    <changefreq>' . $page['changefreq'] . '</changefreq>' . PHP_EOL;
            $xml .= '    <priority>' . $page['priority'] . '</priority>' . PHP_EOL;
            $xml .= '  </url>' . PHP_EOL;
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
