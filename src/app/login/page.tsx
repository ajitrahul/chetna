'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { Mail, Chrome, AlertCircle } from 'lucide-react';

// Force dynamic rendering to avoid build errors with useSearchParams
export const dynamic = 'force-dynamic';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Sign in with credentials
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.error) {
                    setError('Invalid email or password');
                } else {
                    router.push(callbackUrl);
                    router.refresh();
                }
            } else {
                // Register new user
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error || 'Registration failed');
                } else {
                    // Auto sign in after registration
                    const result = await signIn('credentials', {
                        email: formData.email,
                        password: formData.password,
                        redirect: false,
                    });

                    if (result?.error) {
                        setError('Account created but login failed. Please try logging in.');
                    } else {
                        router.push(callbackUrl);
                        router.refresh();
                    }
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await signIn('google', { callbackUrl });
        } catch (err) {
            setError('Google sign-in failed');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className={styles.subtitle}>
                    {isLogin
                        ? 'Sign in to access your chart and insights'
                        : 'Join Chetna for personalized astrological awareness'}
                </p>

                {error && (
                    <div className={styles.error}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLogin && (
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        <Mail size={18} />
                        {loading ? 'Processing...' : (isLogin ? 'Sign In with Email' : 'Sign Up with Email')}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>or</span>
                </div>

                <button onClick={handleGoogleLogin} className={styles.googleBtn} disabled={loading}>
                    <Chrome size={20} />
                    Continue with Google
                </button>

                <div className={styles.toggle}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className={styles.toggleBtn}>
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>

                <p className={styles.disclaimer}>
                    By continuing, you agree to our{' '}
                    <Link href="/terms">Terms of Service</Link> and{' '}
                    <Link href="/privacy">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--gold)' }}>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
