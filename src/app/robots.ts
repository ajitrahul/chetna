import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://askchetna.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin', '/dashboard', '/onboarding'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
