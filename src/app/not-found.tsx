import Link from 'next/link';
import styles from './system.module.css';

export default function NotFound() {
    return (
        <main className={styles.wrap}>
            <span className={styles.glyph}>✦</span>
            <h1 className={styles.code}>404</h1>
            <h2 className={styles.title}>This path isn&apos;t written in the stars</h2>
            <p className={styles.text}>
                The page you&apos;re looking for has drifted out of orbit. Let&apos;s guide you back to familiar skies.
            </p>
            <div className={styles.actions}>
                <Link href="/" className="primary-btn-cosmic">Return Home</Link>
                <Link href="/clarity" className={styles.secondaryLink}>Ask Chetna AI</Link>
            </div>
        </main>
    );
}
