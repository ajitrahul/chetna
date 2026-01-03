'use client';

import Link from 'next/link';
import styles from './Footer.module.css';
import { Mail, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                {/* About Section */}
                <div className={styles.footerSection}>
                    <h3>About Chetna</h3>
                    <p>
                        An awareness-first astrology platform designed to support reflection, understanding, and conscious decision-making.
                    </p>
                    <div className={styles.socialLinks}>
                        <a href="mailto:hello@chetna.app" className={styles.socialIcon} aria-label="Email">
                            <Mail size={18} />
                        </a>
                        <a href="#" className={styles.socialIcon} aria-label="Twitter">
                            <Twitter size={18} />
                        </a>
                        <a href="#" className={styles.socialIcon} aria-label="Instagram">
                            <Instagram size={18} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className={styles.footerSection}>
                    <h3>Explore</h3>
                    <ul className={styles.footerLinks}>
                        <li><Link href="/how-it-works">How It Works</Link></li>
                        <li><Link href="/chart">Your Chart</Link></li>
                        <li><Link href="/timing">Timing & Phases</Link></li>
                        <li><Link href="/synastry">Synastry</Link></li>
                        <li><Link href="/clarity">Get Clarity</Link></li>
                    </ul>
                </div>

                {/* Legal Links */}
                <div className={styles.footerSection}>
                    <h3>Legal</h3>
                    <ul className={styles.footerLinks}>
                        <li><Link href="/disclaimer">Disclaimer</Link></li>
                        <li><Link href="/privacy">Privacy Policy</Link></li>
                        <li><Link href="/terms">Terms of Service</Link></li>
                        <li><Link href="/contact">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Newsletter Section */}
                <div className={styles.footerSection}>
                    <h3>Cosmic Updates</h3>
                    <p className={styles.newsletterText}>
                        Receive weekly insights on planetary movements and cosmic energy.
                    </p>
                    <form className={styles.subscribeForm} onSubmit={async (e) => {
                        e.preventDefault();
                        const email = (e.target as any).email.value;
                        if (!email) return;

                        const btn = (e.target as any).querySelector('button');
                        const originalText = btn.innerText;
                        btn.disabled = true;
                        btn.innerText = '...';

                        try {
                            const res = await fetch('/api/newsletter/subscribe', {
                                method: 'POST',
                                body: JSON.stringify({ email }),
                                headers: { 'Content-Type': 'application/json' }
                            });
                            if (res.ok) {
                                alert('Subscribed! Welcome to Chetna.');
                                (e.target as any).reset();
                            } else {
                                alert('Something went wrong. Please try again.');
                            }
                        } catch (err) {
                            alert('Something went wrong. Please try again.');
                        } finally {
                            btn.disabled = false;
                            btn.innerText = originalText;
                        }
                    }}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            required
                            className={styles.subscribeInput}
                        />
                        <button type="submit" className={styles.subscribeBtn}>Join</button>
                    </form>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <p className={styles.copyright}>
                    © {new Date().getFullYear()} Chetna. All rights reserved.
                </p>
                <p className={styles.productRule}>
                    Astrology is interpretive, not deterministic.
                </p>
            </div>
        </footer>
    );
}
