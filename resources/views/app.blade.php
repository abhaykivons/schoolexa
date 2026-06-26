<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- ✅ SEO Meta Tags --}}
    <title inertia>{{ config('app.name', 'SchoolExa') }} - Best School Management Software in USA | ERP & SIS for K-12</title>
    <meta name="description" content="SchoolExa is a complete School Management Software for schools. Manage admissions, attendance, finance, payroll, staff, students, parent communication, library, and more in one FERPA-compliant ERP & SIS system.">
    <meta name="keywords" content="SchoolExa, School Management Software USA, Student Information System USA, School ERP USA, K-12 SIS, Attendance Software for Schools, Parent Portal Software USA, School Payroll Software, Academic Management System, School Administration Software, School Compliance FERPA, School Communication Platform, Best School Management Software USA">
    <meta name="author" content="{{ config('app.name', 'SchoolExa') }}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">

    {{-- ✅ Open Graph / Facebook --}}
    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ config('app.name', 'SchoolExa') }} - Best School Management Software in USA">
    <meta property="og:description" content="Discover SchoolExa – the all-in-one, FERPA-compliant school ERP & SIS for schools. Manage students, staff, finance, academics, attendance, and communication effortlessly.">
    <meta property="og:image" content="{{ asset('og-image.jpg') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:site_name" content="{{ config('app.name', 'SchoolExa') }}">

    {{-- ✅ Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ config('app.name', 'SchoolExa') }} - USA School ERP & SIS Software">
    <meta name="twitter:description" content="SchoolExa helps schools manage admissions, attendance, payroll, finance & parent engagement with a secure, FERPA-compliant ERP & SIS.">
    <meta name="twitter:image" content="{{ asset('og-image.jpg') }}">

    {{-- ✅ Structured Data (JSON-LD for SEO Rich Snippets & Sitelinks) --}}
    
    {{-- Organization Schema --}}
    @verbatim
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "SchoolExa",
        "url": "https://schoolexa.com",
        "logo": "https://schoolexa.com/logo.svg",
        "description": "SchoolExa is the best cloud-based School Management Software in USA helping schools manage all their crucial administrative processes through automation.",
        "foundingDate": "2019",
        "sameAs": [
            "https://twitter.com/schoolexa",
            "https://www.linkedin.com/company/schoolexa",
            "https://www.facebook.com/schoolexa"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["English"]
        },
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
        }
    }
    </script>
    @endverbatim

    {{-- WebSite Schema with SearchAction - Critical for Sitelinks --}}
    @verbatim
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "SchoolExa",
        "alternateName": "SchoolExa - School Management Software",
        "url": "https://schoolexa.com",
        "description": "SchoolExa is the best cloud-based School Management Software in USA helping schools manage all their crucial processes through automation.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://schoolexa.com/docs?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        },
        "publisher": {
            "@type": "Organization",
            "name": "SchoolExa",
            "url": "https://schoolexa.com"
        }
    }
    </script>
    @endverbatim

    {{-- SiteNavigationElement Schema - Helps Google Understand Site Structure for Sitelinks --}}
    @verbatim
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SiteNavigationElement",
                "name": "Pricing",
                "description": "Explore transparent pricing plans for SchoolExa school management software",
                "url": "https://schoolexa.com/pricing"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "About Us",
                "description": "Learn about SchoolExa's mission, team, and story",
                "url": "https://schoolexa.com/about"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Careers",
                "description": "Join our team of industry experts building the future of education technology",
                "url": "https://schoolexa.com/careers"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Partners",
                "description": "Become a SchoolExa referral partner and grow your career",
                "url": "https://schoolexa.com/partners"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Documentation",
                "description": "Explore SchoolExa's comprehensive documentation and guides",
                "url": "https://schoolexa.com/docs"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Help Center",
                "description": "Get support and answers to common questions",
                "url": "https://schoolexa.com/help-center"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Contact Us",
                "description": "Get in touch with our sales and support team",
                "url": "https://schoolexa.com/contact"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Security",
                "description": "Learn about our security practices and compliance",
                "url": "https://schoolexa.com/security"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "School Management Software",
                "description": "Best school management software for K-12 schools",
                "url": "https://schoolexa.com/school-management-software"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Student Information System",
                "description": "Comprehensive SIS for student data management",
                "url": "https://schoolexa.com/student-information-system"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Privacy Policy",
                "description": "Read our privacy policy and data protection practices",
                "url": "https://schoolexa.com/privacy-policy"
            },
            {
                "@type": "SiteNavigationElement",
                "name": "Terms of Service",
                "description": "Review our terms of service and usage policies",
                "url": "https://schoolexa.com/terms-of-service"
            }
        ]
    }
    </script>
    @endverbatim

    {{-- SoftwareApplication Schema --}}
    @verbatim
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "SchoolExa",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "School Management Software, ERP, SIS",
        "operatingSystem": "Web, Cloud, iOS, Android",
        "url": "https://schoolexa.com",
        "description": "SchoolExa is a FERPA-compliant School ERP & SIS for schools. Manage admissions, attendance, staff, students, finance, payroll, parent portals, and more from one secure cloud-based platform.",
        "featureList": [
            "Student Information System",
            "Academic Management",
            "Financial Management",
            "Parent Communication Portal",
            "Analytics & Insights Dashboard",
            "FERPA & COPPA Compliance",
            "Attendance Tracking",
            "Report Card Generation"
        ],
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": "1.59",
            "highPrice": "3.99",
            "offerCount": "3",
            "offers": [
                {
                    "@type": "Offer",
                    "name": "Starter Plan",
                    "price": "1.59",
                    "priceCurrency": "USD",
                    "description": "Perfect for small schools up to 500 students"
                },
                {
                    "@type": "Offer",
                    "name": "Professional Plan",
                    "price": "3.99",
                    "priceCurrency": "USD",
                    "description": "Most popular for growing schools up to 2,000 students"
                },
                {
                    "@type": "Offer",
                    "name": "Enterprise Plan",
                    "description": "Custom pricing for large districts and institutions"
                }
            ]
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "500",
            "bestRating": "5",
            "worstRating": "1"
        },
        "creator": {
            "@type": "Organization",
            "name": "SchoolExa",
            "url": "https://schoolexa.com"
        }
    }
    </script>
    @endverbatim

    {{-- ✅ Theme Background --}}
    <style>
        html { background-color: oklch(1 0 0); }
        html.dark { background-color: oklch(0.145 0 0); }
    </style>

    {{-- ✅ Favicons --}}
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/48x48.png" sizes="48x48">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-PTFSQN71HN"></script>
        <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-PTFSQN71HN');
    </script>

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>
<body class="font-sans antialiased">
    @inertia
</body>
</html>