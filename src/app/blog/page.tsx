import Link from 'next/link';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import styles from './Blog.module.css';

// Server-rendered for SEO; revalidate so new admin posts appear without a redeploy.
export const revalidate = 300;

const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export default async function BlogPage() {
    let blogs: { id: string; title: string; createdAt: Date }[] = [];
    try {
        blogs = await prisma.blogPost.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, createdAt: true },
        });
    } catch (error) {
        console.error('Failed to load blogs:', error);
    }

    return (
        <main className={styles.main}>
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Cosmic Journal</h1>
                <p className={styles.heroSubtitle}>Insights, reflections, and astrological wisdom.</p>
            </div>

            <div className={styles.container}>
                {blogs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>The stars are quiet today. Check back soon for new insights.</p>
                    </div>
                ) : (
                    <div className={styles.blogList}>
                        {blogs.map((blog) => (
                            <Link key={blog.id} href={`/blog/${blog.id}`} className={styles.blogItem}>
                                <div className={styles.blogRow}>
                                    <div className={styles.blogInfo}>
                                        <h2 className={styles.blogTitle}>{blog.title}</h2>
                                        <div className={styles.blogMeta}>
                                            <div className={styles.metaIcon}>
                                                <Calendar size={14} />
                                                <span>{formatDate(blog.createdAt)}</span>
                                            </div>
                                            <div className={styles.metaIcon}>
                                                <Clock size={14} />
                                                <span>{formatTime(blog.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className={styles.rowArrow} size={20} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
