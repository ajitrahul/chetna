'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('chetna-theme') as 'light' | 'dark';
        if (savedTheme && savedTheme !== theme) {
            requestAnimationFrame(() => setTheme(savedTheme));
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (!savedTheme) {
            // Default to dark if no preference is saved
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('chetna-theme', newTheme);
    };

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
