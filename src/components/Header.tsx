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

        <div className={styles.rightSection}>
          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/chart" className={styles.navLink}>Chart</Link>
            <Link href="/timing" className={styles.navLink}>Timing</Link>
            <Link href="/clarity" className={styles.navLink}>Clarity</Link>
            <Link href="/synastry" className={styles.navLink}>Synastry</Link>
            <Link href="/pricing" className={styles.navLink}>Pricing</Link>
          </nav>

          <div className={styles.actions}>
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
          </div>
        </div>
      </div>
    </header>
  );
}
