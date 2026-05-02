'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('chetna-theme') as 'light' | 'dark';
        if (savedTheme && savedTheme !== theme) {
            requestAnimationFrame(() => setTheme(savedTheme));
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (!savedTheme) {
            // Default to dark for cosmic aesthetic
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('chetna-theme', newTheme);
    };

    // Avoid hydration mismatch by rendering nothing until mounted
    if (!mounted) {
        return <div className={styles.toggle} style={{ width: 36, height: 36 }} />;
    }

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label="Toggle Theme"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </motion.div>
            </AnimatePresence>
        </button>
    );
}
