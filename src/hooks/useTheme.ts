import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const THEME_EVENT = 'theme-change';

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const stored = localStorage.getItem('theme');
            if (stored === 'dark' || stored === 'light') return stored;
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        }
        return 'light';
    });

    // Apply theme to DOM and localStorage
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Listen for theme changes from other component instances
    useEffect(() => {
        const handler = (e: Event) => {
            const newTheme = (e as CustomEvent<Theme>).detail;
            setTheme(newTheme);
        };
        window.addEventListener(THEME_EVENT, handler);
        return () => window.removeEventListener(THEME_EVENT, handler);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            // Notify all other useTheme instances
            window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
            return next;
        });
    }, []);

    return { theme, toggleTheme };
};
