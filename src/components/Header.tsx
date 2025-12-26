'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './Header.module.css';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" onClick={() => setIsMenuOpen(false)}>
          <Logo width={140} height={50} />
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`${styles.rightSection} ${isMenuOpen ? styles.menuOpen : ''}`}>
          <nav className={styles.navLinks}>
            <Link href="/" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/chart" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Chart</Link>
            <Link href="/timing" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Timing</Link>
            <Link href="/clarity" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Clarity</Link>
            <Link href="/synastry" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Synastry</Link>
            <Link href="/pricing" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Pricing</Link>
          </nav>

          <div className={styles.actions}>
            <ThemeToggle />
            {status === 'authenticated' ? (
              <div className={styles.authGroup}>
                <Link href="/api/credits/add-test" className={styles.testBtn} onClick={() => setIsMenuOpen(false)}>
                  + Credits (Test)
                </Link>
                <Link href="/profile" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                  {session?.user?.name || 'Profile'}
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className={styles.signOutBtn}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className={styles.loginBtn} onClick={() => setIsMenuOpen(false)}>Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
