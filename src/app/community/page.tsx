'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MessageSquare, Search, Plus, Clock, User, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import Image from 'next/image';

interface Topic {
    id: string;
    title: string;
    content: string;
    userId: string;
    user: {
        name: string;
        image: string | null;
    };
    _count: {
        posts: number;
    };
    createdAt: string;
}

export default function CommunityPage() {
    const { data: session } = useSession();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            const res = await fetch('/api/community/topics');
            if (res.ok) {
                const data = await res.json();
                setTopics(data);
            }
        } catch (error) {
            console.error('Failed to fetch topics:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTopics = topics.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.loader}></div>
                <p>Connecting to the collective awareness...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.hero}>
                <h1 className={styles.title}>Community</h1>
                <p className={styles.subtitle}>
                    A space for shared insights, astrological reflections, and collective growth.
                    Ask questions, share patterns, and find awareness together.
                </p>
            </header>

            <div className={styles.actions}>
                <div className={styles.searchBar}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search topics..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '44px' }}
                    />
                </div>

                <Link href={session ? "/community/new" : "/login?callbackUrl=/community/new"} className={styles.createBtn}>
                    <Plus size={18} /> New Topic
                </Link>
            </div>

            <div className={styles.topicList}>
                {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => (
                        <Link href={`/community/topics/${topic.id}`} key={topic.id} className={styles.topicCard}>
                            <div className={styles.topicHeader}>
                                <h2 className={styles.topicTitle}>{topic.title}</h2>
                                <ChevronRight size={20} color="var(--accent-gold)" opacity={0.5} />
                            </div>

                            <p className={styles.topicSnippet}>{topic.content}</p>

                            <div className={styles.topicMeta}>
                                <div className={styles.author}>
                                    {topic.user.image ? (
                                        <Image src={topic.user.image} alt={topic.user.name} width={20} height={20} className={styles.avatarMini} />
                                    ) : (
                                        <User size={14} />
                                    )}
                                    <span>{topic.user.name}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <Clock size={14} />
                                    <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <MessageSquare size={14} />
                                    <span>{topic._count.posts} replies</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                        <p>{searchQuery ? "No topics found matching your search." : "No topics yet. Be the first to start a conversation!"}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
