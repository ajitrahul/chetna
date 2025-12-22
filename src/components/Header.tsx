'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import Logo from './Logo';
import { Moon, Sun } from 'lucide-react';

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check system pref
    if (typeof window !== 'undefined' && window.matchMedia) {
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(darkMode);

      // Listen for changes
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
      return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
    }
  }, []);

  // Prevent hydration mismatch by rendering a placeholder or same structure
  // but without the icon specific to theme until mounted
  // However, for SSG/SSR simple render is better

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/">
          <Logo width={140} height={50} />
        </Link>

        <nav className={styles.nav}>
          <Link href="/how-it-works" className={styles.navLink}>Philosophy</Link>
          <Link href="/chart" className={styles.navLink}>Your Chart</Link>
          <Link href="/synastry" className={styles.navLink}>Synastry</Link>
          <Link href="/clarity" className={styles.navLink}>Get Clarity</Link>

          {mounted && (
            <button
              className={styles.themeToggle}
              onClick={() => alert("Theme switching follows your system settings automatically!")}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
