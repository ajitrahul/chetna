
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminDashboard.module.css';

interface PricingPlan {
    id: string;
    key: string;
    name: string;
    description: string;
    price: number;
    credits: number;
}

interface ServiceCost {
    key: string;
    credits: number;
    description: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    isSubscribed: boolean;
    credits: number;
}

interface AnalyticsData {
    totalUsers: number;
    totalQuestions: number;
    totalRevenue: number;
    activeProfiles: number;
    dailyViews: number;
    totalViews: number;
    topCountries: Array<{ country: string; _count: { country: number } }>;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'analytics' | 'pricing' | 'users' | 'newsletter'>('analytics');
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [services, setServices] = useState<ServiceCost[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // User Filters State
    const [userFilters, setUserFilters] = useState({
        subscribed: 'all',
        city: '',
        minCredits: 0
    });

    // Newsletter State
    const [newsletterSubject, setNewsletterSubject] = useState('');
    const [newsletterContent, setNewsletterContent] = useState('');
    const [sendingNewsletter, setSendingNewsletter] = useState(false);

    useEffect(() => {
        fetchData();
    }, [userFilters]); // Re-fetch when filters change

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Build query params for users
            const userParams = new URLSearchParams({
                limit: '100',
                subscribed: userFilters.subscribed,
                city: userFilters.city,
                minCredits: userFilters.minCredits.toString()
            });

            const [analyticsRes, pricingRes, servicesRes, usersRes] = await Promise.all([
                fetch('/api/admin/analytics'),
                fetch('/api/admin/pricing'),
                fetch('/api/admin/services'),
                fetch(`/api/admin/users?${userParams.toString()}`)
            ]);

            if (analyticsRes.status === 401) {
                router.push('/login');
                return;
            }

            if (!analyticsRes.ok || !pricingRes.ok || !servicesRes.ok || !usersRes.ok) {
                throw new Error('Some data failed to load');
            }

            const aData = await analyticsRes.json();
            const pData = await pricingRes.json();
            const sData = await servicesRes.json();
            const uData = await usersRes.json();

            setAnalytics(aData);
            setPlans(pData);
            setServices(sData);
            setUsers(uData?.users || []);
        } catch (error: any) {
            console.error('Failed to load admin data', error);
            setError(error.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePrice = async (key: string, newPrice: number) => {
        if (!confirm(`Update price for ${key} to ₹${newPrice}?`)) return;
        try {
            const res = await fetch('/api/admin/pricing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, price: newPrice * 100 })
            });
            if (res.ok) {
                alert('Price updated!');
                fetchData();
            } else {
                alert('Failed to update price');
            }
        } catch (e) {
            alert('Error updating price');
        }
    };

    const handleUpdateServiceCost = async (key: string, newCredits: number) => {
        if (!confirm(`Update cost for ${key} to ${newCredits} credits?`)) return;
        try {
            const res = await fetch('/api/admin/services', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, credits: newCredits })
            });
            if (res.ok) {
                alert('Service cost updated!');
                fetchData();
            } else {
                alert('Failed to update service cost');
            }
        } catch (e) {
            alert('Error updating service cost');
        }
    };

    const handleSendNewsletter = async () => {
        if (!confirm('Are you sure you want to send this email to ALL subscribed users?')) return;

        setSendingNewsletter(true);
        try {
            const res = await fetch('/api/admin/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: newsletterSubject, content: newsletterContent })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Newsletter sent to ${data.count} users.`);
                setNewsletterSubject('');
                setNewsletterContent('');
            } else {
                alert('Failed to send newsletter: ' + data.error);
            }
        } catch (e) {
            alert('Error sending newsletter');
        } finally {
            setSendingNewsletter(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading Admin Dashboard...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <h2 className={styles.logo}>Chetna Admin</h2>
                <nav className={styles.nav}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Analytics
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'pricing' ? styles.active : ''}`}
                        onClick={() => setActiveTab('pricing')}
                    >
                        Pricing & Services
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'newsletter' ? styles.active : ''}`}
                        onClick={() => setActiveTab('newsletter')}
                    >
                        Newsletter
                    </button>
                </nav>
            </div>

            <main className={styles.content}>
                {activeTab === 'analytics' && analytics && (
                    <div className={styles.analyticsGrid}>
                        <div className={styles.statCard}>
                            <h3>Total Revenue</h3>
                            <p className={styles.statValue}>₹{analytics.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Total Users</h3>
                            <p className={styles.statValue}>{analytics.totalUsers}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Daily Views</h3>
                            <p className={styles.statValue}>{analytics.dailyViews}</p>
                        </div>
                        <div className={styles.statCard}>
                            <h3>Total Views</h3>
                            <p className={styles.statValue}>{analytics.totalViews}</p>
                        </div>

                        <div className={styles.section} style={{ gridColumn: '1 / -1' }}>
                            <h3>Top Locations</h3>
                            <div className={styles.geoGrid}>
                                {analytics.topCountries.map((c, i) => (
                                    <div key={i} className={styles.geoItem}>
                                        <span>{c.country || 'Unknown'}</span>
                                        <strong>{c._count.country}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>User Management</h3>
                            <button className={styles.saveBtn} onClick={fetchData} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Refresh</button>
                        </div>

                        {/* Filters Bar */}
                        <div className={styles.filterBar}>
                            <div className={styles.filterGroup}>
                                <label>Newsletter</label>
                                <select
                                    value={userFilters.subscribed}
                                    onChange={(e) => setUserFilters({ ...userFilters, subscribed: e.target.value })}
                                    className={styles.input}
                                    style={{ width: '120px' }}
                                >
                                    <option value="all">All Users</option>
                                    <option value="true">Subscribed</option>
                                    <option value="false">Unsubscribed</option>
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label>City</label>
                                <input
                                    type="text"
                                    placeholder="Search city..."
                                    value={userFilters.city}
                                    onChange={(e) => setUserFilters({ ...userFilters, city: e.target.value })}
                                    className={styles.input}
                                    style={{ width: '150px' }}
                                />
                            </div>
                            <div className={styles.filterGroup}>
                                <label>Min Credits</label>
                                <input
                                    type="number"
                                    value={userFilters.minCredits}
                                    onChange={(e) => setUserFilters({ ...userFilters, minCredits: parseInt(e.target.value || '0') })}
                                    className={styles.input}
                                    style={{ width: '100px' }}
                                />
                            </div>
                        </div>

                        {error && <div style={{ color: '#F44336', marginBottom: '1rem' }}>{error}</div>}

                        <div style={{ overflowX: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>City</th>
                                        <th>Joined</th>
                                        <th>Credits</th>
                                        <th>Subscribed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? users.map((u: any) => (
                                        <tr key={u.id}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.city}</td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td><strong>{u.credits}</strong></td>
                                            <td>
                                                <span style={{
                                                    color: u.isSubscribed ? '#4CAF50' : 'var(--text-muted)',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {u.isSubscribed ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                No users found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className={styles.pricingSection}>
                        <div className={styles.section}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Service Credit Costs</h3>
                                <div className={styles.filterGroup} style={{ marginBottom: 0 }}>
                                    <select
                                        className={styles.input}
                                        style={{ width: '150px' }}
                                        onChange={(e) => {
                                            const type = e.target.value;
                                            const items = document.querySelectorAll(`.${styles.planEditor}[data-type]`);
                                            items.forEach((item: any) => {
                                                if (type === 'all' || item.dataset.type === type) {
                                                    item.style.display = 'block';
                                                } else {
                                                    item.style.display = 'none';
                                                }
                                            });
                                        }}
                                    >
                                        <option value="all">All Services</option>
                                        <option value="chart">Charts Only</option>
                                        <option value="other">Other Services</option>
                                    </select>
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Define how many credits each service consumes.</p>
                            <div className={styles.pricingList}>
                                {services.map(service => (
                                    <div
                                        key={service.key}
                                        className={styles.planEditor}
                                        data-type={service.key.startsWith('CHART_') ? 'chart' : 'other'}
                                    >
                                        <div className={styles.planHeader}>
                                            <h4>{service.key.replace('CHART_', '')}</h4>
                                            <span className={styles.planKey}>{service.key.startsWith('CHART_') ? 'Chart Unlock' : 'Action'}</span>
                                        </div>
                                        <div className={styles.planBody}>
                                            <label>Credits Required</label>
                                            <div className={styles.priceInputGroup}>
                                                <input
                                                    type="number"
                                                    defaultValue={service.credits}
                                                    id={`service-${service.key}`}
                                                    min="0"
                                                />
                                                <button
                                                    className={styles.saveBtn}
                                                    onClick={() => {
                                                        const val = (document.getElementById(`service-${service.key}`) as HTMLInputElement).value;
                                                        handleUpdateServiceCost(service.key, parseInt(val));
                                                    }}
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.section} style={{ marginTop: '3rem' }}>
                            <h3>Credit Pricing Plans</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Set the valid purchase plans for users.</p>
                            <div className={styles.pricingList}>
                                {plans.map(plan => (
                                    <div key={plan.key} className={styles.planEditor}>
                                        <div className={styles.planHeader}>
                                            <h4>{plan.name}</h4>
                                            <span className={styles.planKey}>{plan.key}</span>
                                        </div>
                                        <div className={styles.planBody}>
                                            <label>Price (₹)</label>
                                            <div className={styles.priceInputGroup}>
                                                <input
                                                    type="number"
                                                    defaultValue={plan.price / 100}
                                                    id={`price-${plan.key}`}
                                                />
                                                <button
                                                    className={styles.saveBtn}
                                                    onClick={() => {
                                                        const val = (document.getElementById(`price-${plan.key}`) as HTMLInputElement).value;
                                                        handleUpdatePrice(plan.key, parseFloat(val));
                                                    }}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'newsletter' && (
                    <div className={styles.newsletterSection}>
                        <h3>Compose Newsletter</h3>
                        <div className={styles.formGroup}>
                            <label>Subject</label>
                            <input
                                type="text"
                                value={newsletterSubject}
                                onChange={(e) => setNewsletterSubject(e.target.value)}
                                placeholder="Enter email subject"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Content (HTML supported)</label>
                            <textarea
                                value={newsletterContent}
                                onChange={(e) => setNewsletterContent(e.target.value)}
                                rows={10}
                                placeholder="Write your update here... Use <br> for new lines, <b> for bold."
                                className={styles.textarea}
                            />
                        </div>
                        <button
                            className={styles.sendBtn}
                            onClick={handleSendNewsletter}
                            disabled={sendingNewsletter || !newsletterSubject || !newsletterContent}
                        >
                            {sendingNewsletter ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
