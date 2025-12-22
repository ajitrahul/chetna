'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import Logo from './Logo';
import { Moon, Sun, Menu, X } from 'lucide-react';

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check system pref
    if (typeof window !== 'undefined' && window.matchMedia) {
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(darkMode);

      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
      return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
    }
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" onClick={() => setIsMenuOpen(false)}>
          <Logo width={140} height={50} />
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.desktopNav}>
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

        {/* Mobile Toggle */}
        {mounted && (
          <div className={styles.mobileActions}>
            <button
              className={styles.themeToggle}
              style={{ marginRight: '8px' }}
              onClick={() => alert("Theme switching follows your system settings automatically!")}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={styles.menuBtn} onClick={toggleMenu} aria-label="Toggle Menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            <nav className={styles.mobileNav}>
              <Link href="/how-it-works" className={styles.mobileLink} onClick={toggleMenu}>Philosophy</Link>
              <Link href="/chart" className={styles.mobileLink} onClick={toggleMenu}>Your Chart</Link>
              <Link href="/synastry" className={styles.mobileLink} onClick={toggleMenu}>Synastry</Link>
              <Link href="/clarity" className={styles.mobileLink} onClick={toggleMenu}>Get Clarity</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
