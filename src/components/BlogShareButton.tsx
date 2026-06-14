'use client';

import { MessageCircle } from 'lucide-react';
import styles from '../app/blog/Blog.module.css';

// Client share button — shares the current per-post URL (now that posts have their own routes)
export default function BlogShareButton({ title }: { title: string }) {
    const handleShare = () => {
        const url = typeof window !== 'undefined' ? window.location.href : 'https://askchetna.com/blog';
        const text = encodeURIComponent(`${title} — read on AskChetna: ${url}`);
        window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <button className={styles.whatsappShare} onClick={handleShare}>
            <MessageCircle size={16} /> Share on WhatsApp
        </button>
    );
}
