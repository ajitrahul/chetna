import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://askchetna.com';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // Public, indexable routes. Authenticated/admin/api routes are intentionally excluded.
    const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
        { path: '/', priority: 1.0, changeFrequency: 'weekly' },
        { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/blog', priority: 0.9, changeFrequency: 'weekly' },
        { path: '/glossary', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/how-it-works', priority: 0.6, changeFrequency: 'monthly' },
        { path: '/how-we-calculate', priority: 0.6, changeFrequency: 'monthly' },
        { path: '/clarity', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/chart', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/timing', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/synastry', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/disclaimer', priority: 0.3, changeFrequency: 'yearly' },
        { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
        { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
        { path: '/refund', priority: 0.3, changeFrequency: 'yearly' },
        { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
    ];

    const staticEntries: MetadataRoute.Sitemap = routes.map((r) => ({
        url: `${BASE_URL}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }));

    // Individual blog posts — indexable and addressable
    let postEntries: MetadataRoute.Sitemap = [];
    try {
        const posts = await prisma.blogPost.findMany({ select: { id: true, updatedAt: true } });
        postEntries = posts.map((p) => ({
            url: `${BASE_URL}/blog/${p.id}`,
            lastModified: p.updatedAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));
    } catch (error) {
        console.error('Sitemap: failed to load blog posts:', error);
    }

    return [...staticEntries, ...postEntries];
}
