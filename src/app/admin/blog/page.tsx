'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './AdminBlog.module.css';
import { ArrowLeft, Send, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function AdminBlogContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const blogId = searchParams.get('id');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingBlog, setIsLoadingBlog] = useState(!!blogId);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Basic admin check client-side
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    // Fetch blog if in edit mode
    useEffect(() => {
        if (blogId) {
            const fetchBlog = async () => {
                try {
                    const res = await fetch(`/api/blogs/${blogId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setTitle(data.title);
                        setContent(data.content);
                    } else {
                        setMessage({ type: 'error', text: 'Failed to find blog post' });
                    }
                } catch (error) {
                    setMessage({ type: 'error', text: 'Error loading blog post' });
                } finally {
                    setIsLoadingBlog(false);
                }
            };
            fetchBlog();
        }
    }, [blogId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        const url = blogId ? `/api/blogs/${blogId}` : '/api/blogs';
        const method = blogId ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });

            if (res.ok) {
                setMessage({
                    type: 'success',
                    text: blogId ? 'Blog post updated successfully!' : 'Blog post created successfully!'
                });
                if (!blogId) {
                    setTitle('');
                    setContent('');
                }
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Failed to save blog post' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading' || isLoadingBlog) return <div className={styles.loading}>Preparing cosmic workspace...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={() => router.back()} className={styles.backLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={20} />
                    <span>Go Back</span>
                </button>
                <h1 className={styles.title}>
                    {blogId ? 'Admin: Edit Blog Post' : 'Admin: Create Blog Post'}
                </h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <label htmlFor="title">Blog Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a compelling title..."
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your astrological insights..."
                        required
                        rows={12}
                    />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? (blogId ? 'Saving...' : 'Posting...') : (
                        <>
                            {blogId ? <Save size={18} /> : <Send size={18} />}
                            <span>{blogId ? 'Save Changes' : 'Post Blog'}</span>
                        </>
                    )}
                </button>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                )}
            </form>
        </div>
    );
}

export default function AdminBlogPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <AdminBlogContent />
        </Suspense>
    );
}
