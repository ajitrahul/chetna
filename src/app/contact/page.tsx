'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { Mail, Send } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        company: '' // honeypot — real users never fill this
    });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to send message.');
            }
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '', company: '' });
            setTimeout(() => setSubmitted(false), 4000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Contact Us</h1>
            <p className={styles.subtitle}>
                We&apos;re here to help. Send us a message and we&apos;ll respond as soon as possible.
            </p>

            <div className={styles.content}>
                <div className={styles.infoSection}>
                    <h2>Get in Touch</h2>
                    <div className={styles.contactInfo}>
                        <div className={styles.infoItem}>
                            <Mail size={24} color="var(--accent-gold)" />
                            <div>
                                <h3>Email</h3>
                                <a href="mailto:hello@askchetna.com">hello@askchetna.com</a>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Mail size={24} color="var(--accent-gold)" />
                            <div>
                                <h3>Support</h3>
                                <a href="mailto:support@askchetna.com">support@askchetna.com</a>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Honeypot — visually hidden, ignored by humans, filled by bots */}
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                    />

                    <div className={styles.formGroup}>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Your name"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            placeholder="How can we help?"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={6}
                            placeholder="Tell us more..."
                        />
                    </div>

                    {error && <p className={styles.formError}>{error}</p>}

                    <button type="submit" className={styles.submitBtn} disabled={sending || submitted}>
                        {sending ? 'Sending…' : submitted ? 'Message Sent!' : (
                            <>
                                Send Message <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
