'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronLeft, Send, Sparkles } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function NewTopicPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (status === 'unauthenticated') {
        router.push('/login?callbackUrl=/community/new');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            setError('Please fill in both title and content');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/community/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });

            if (res.ok) {
                const topic = await res.json();
                router.push(`/community/topics/${topic.id}`);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create topic');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/community" className={styles.backLink}>
                    <ChevronLeft size={16} /> Back to Community
                </Link>
                <h1 className={styles.title}>Start a Conversation</h1>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Discussion Title</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="What's on your mind?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Your Thoughts</label>
                    <textarea
                        className={`${styles.input} ${styles.textarea}`}
                        placeholder="Share your astrological insights, questions, or reflections..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || !title || !content}
                >
                    {loading ? "Aligning..." : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Post Discussion <Send size={18} />
                        </span>
                    )}
                </button>
            </form>

            <div style={{ marginTop: '32px', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
                <Sparkles size={14} style={{ marginBottom: '4px' }} />
                <p>Remember to keep discussions mindful and focused on awareness.</p>
            </div>
        </div>
    );
}
