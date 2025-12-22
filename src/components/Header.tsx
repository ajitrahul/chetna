'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './Header.module.css';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { data: session, status } = useSession();

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
          <ThemeToggle />

          {status === 'authenticated' ? (
            <div className={styles.authGroup}>
              <Link href="/profile" className={styles.navLink}>
                {session?.user?.name || 'Profile'}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={styles.signOutBtn}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" className={styles.loginBtn}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
