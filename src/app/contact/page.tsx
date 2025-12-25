'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { Mail, Send } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send to a backend API
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
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
                                <a href="mailto:hello@chetna.app">hello@chetna.app</a>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Mail size={24} color="var(--accent-gold)" />
                            <div>
                                <h3>Support</h3>
                                <a href="mailto:support@chetna.app">support@chetna.app</a>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
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

                    <button type="submit" className={styles.submitBtn} disabled={submitted}>
                        {submitted ? 'Message Sent!' : (
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
