'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import styles from './Blog.module.css';
import { Calendar, Clock, ChevronRight, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

export default function BlogPage() {
    const { data: session, status } = useSession();
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'authenticated') {
            const fetchBlogs = async () => {
                try {
                    const res = await fetch('/api/blogs');
                    if (res.ok) {
                        const data = await res.json();
                        setBlogs(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch blogs:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchBlogs();
        } else if (status === 'unauthenticated') {
            setIsLoading(false);
        }
    }, [status]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading || status === 'loading') {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Aligning with cosmic insights...</p>
            </div>
        );
    }

    const selectedBlog = blogs.find(b => b.id === selectedBlogId);

    return (
        <main className={styles.main}>
            {status === 'unauthenticated' && (
                <div className={styles.loginOverlay}>
                    <div className={styles.loginCard}>
                        <div className={styles.lockIcon}>
                            <Lock size={32} />
                        </div>
                        <h2>Unlock Cosmic Wisdom</h2>
                        <p>Sign in to access our exclusive astrological insights and reflections.</p>
                        <button
                            className={styles.googleSignIn}
                            onClick={() => signIn('google')}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                            <span>Sign in with Google</span>
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Cosmic Journal</h1>
                <p className={styles.heroSubtitle}>Insights, reflections, and astrological wisdom.</p>
            </div>

            <div className={status === 'unauthenticated' ? styles.blurredContainer : styles.container}>
                {selectedBlog ? (
                    <div className={styles.detailView}>
                        <button
                            className={styles.backButton}
                            onClick={() => setSelectedBlogId(null)}
                        >
                            <ArrowLeft size={18} />
                            <span>Back to Blogs</span>
                        </button>

                        <div className={styles.fullPost}>
                            <div className={styles.detailMeta}>
                                <div className={styles.metaIcon}>
                                    <Calendar size={16} />
                                    <span>{formatDate(selectedBlog.createdAt)}</span>
                                </div>
                                <div className={styles.metaIcon}>
                                    <Clock size={16} />
                                    <span>{formatTime(selectedBlog.createdAt)}</span>
                                </div>
                            </div>
                            <h2 className={styles.detailTitle}>{selectedBlog.title}</h2>
                            <div className={styles.fullContent}>
                                {selectedBlog.content.split('\n').map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    blogs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>The stars are quiet today. Check back soon for new insights.</p>
                        </div>
                    ) : (
                        <div className={styles.blogList}>
                            {blogs.map((blog) => (
                                <div
                                    key={blog.id}
                                    className={styles.blogItem}
                                    onClick={() => setSelectedBlogId(blog.id)}
                                >
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
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </main>
    );
}
