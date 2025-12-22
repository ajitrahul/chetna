'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import Logo from './Logo';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/">
          <Logo width={140} height={50} />
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/how-it-works" className={styles.navLink}>How It Works</Link>
          <Link href="/chart" className={styles.navLink}>Your Chart</Link>
          <Link href="/clarity" className={styles.navLink}>Ask for Clarity</Link>
          <Link href="/login" className={styles.loginBtn}>Login</Link>
        </nav>
      </div>
    </header>
  );
}
