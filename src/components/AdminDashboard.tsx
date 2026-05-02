
'use client';

import { useState, useEffect, useCallback } from 'react';
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
    city: string;
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

interface BlogPost {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

type CreditRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface CreditRequest {
    id: string;
    requestedCredits: number;
    reason: string | null;
    status: CreditRequestStatus;
    adminNote: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'analytics' | 'pricing' | 'users' | 'newsletter' | 'blogs' | 'creditRequests'>('analytics');
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [services, setServices] = useState<ServiceCost[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // User Filters State
    const [userFilters, setUserFilters] = useState({
        subscribed: 'all',
        city: '',
        minCredits: 0
    });
    const [creditRequestFilter, setCreditRequestFilter] = useState<'ALL' | CreditRequestStatus>('PENDING');

    // Newsletter State
    const [newsletterSubject, setNewsletterSubject] = useState('');
    const [newsletterContent, setNewsletterContent] = useState('');
    const [sendingNewsletter, setSendingNewsletter] = useState(false);

    const fetchData = useCallback(async () => {
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
            const creditRequestParams = new URLSearchParams();
            if (creditRequestFilter !== 'ALL') {
                creditRequestParams.set('status', creditRequestFilter);
            }

            const [analyticsRes, pricingRes, servicesRes, usersRes, blogsRes, creditRequestsRes] = await Promise.all([
                fetch('/api/admin/analytics'),
                fetch('/api/admin/pricing'),
                fetch('/api/admin/services'),
                fetch(`/api/admin/users?${userParams.toString()}`),
                fetch('/api/blogs'),
                fetch(`/api/admin/credit-requests?${creditRequestParams.toString()}`)
            ]);

            if (analyticsRes.status === 401) {
                router.push('/login');
                return;
            }

            if (!analyticsRes.ok || !pricingRes.ok || !servicesRes.ok || !usersRes.ok || !blogsRes.ok || !creditRequestsRes.ok) {
                throw new Error('Some data failed to load');
            }

            const aData = await analyticsRes.json();
            const pData = await pricingRes.json();
            const sData = await servicesRes.json();
            const uData = await usersRes.json();
            const bData = await blogsRes.json();
            const cData = await creditRequestsRes.json();

            setAnalytics(aData);
            setPlans(pData);
            setServices(sData);
            setUsers(uData?.users || []);
            setBlogs(bData);
            setCreditRequests(cData?.requests || []);
        } catch (error: unknown) {
            console.error('Failed to load admin data', error);
            setError(error instanceof Error ? error.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [router, userFilters, creditRequestFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Re-fetch when filters change

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
        } catch {
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
        } catch {
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
        } catch {
            alert('Error sending newsletter');
        } finally {
            setSendingNewsletter(false);
        }
    };

    const handleReviewCreditRequest = async (id: string, action: 'APPROVE' | 'REJECT') => {
        const adminNote = prompt(
            action === 'APPROVE'
                ? 'Optional note for the user (approval message):'
                : 'Optional reason for rejection:'
        ) || '';

        if (!confirm(`Are you sure you want to ${action.toLowerCase()} this credit request?`)) return;

        try {
            const res = await fetch(`/api/admin/credit-requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, adminNote })
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to review request');
                return;
            }

            alert(data.message || `Request ${action.toLowerCase()}d.`);
            fetchData();
        } catch (error) {
            console.error('Credit request review error:', error);
            alert('Error reviewing credit request');
        }
    };

    const handleDeleteBlog = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post? This action is permanent.')) return;

        try {
            const res = await fetch(`/api/blogs/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Blog post deleted');
                fetchData();
            } else {
                const data = await res.json();
                alert('Failed to delete blog: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Delete blog error:', error);
            alert('Error deleting blog post');
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
                        className={`${styles.navItem} ${activeTab === 'creditRequests' ? styles.active : ''}`}
                        onClick={() => setActiveTab('creditRequests')}
                    >
                        Credit Requests
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
                    <button
                        className={`${styles.navItem} ${activeTab === 'blogs' ? styles.active : ''}`}
                        onClick={() => setActiveTab('blogs')}
                    >
                        Blogs
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
                                    {users.length > 0 ? users.map((u) => (
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

                {activeTab === 'creditRequests' && (
                    <div className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                            <h3>Credit Request Approvals</h3>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <select
                                    value={creditRequestFilter}
                                    onChange={(e) => setCreditRequestFilter(e.target.value as 'ALL' | CreditRequestStatus)}
                                    className={styles.input}
                                    style={{ width: '160px' }}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="ALL">All Requests</option>
                                </select>
                                <button className={styles.saveBtn} onClick={fetchData} style={{ padding: '8px 14px' }}>
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {error && <div style={{ color: '#F44336', marginBottom: '1rem' }}>{error}</div>}

                        <div style={{ overflowX: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Credits</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Requested</th>
                                        <th>Reviewed</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {creditRequests.length > 0 ? creditRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <strong>{request.user.name || 'Unknown User'}</strong>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{request.user.email}</span>
                                                </div>
                                            </td>
                                            <td><strong>{request.requestedCredits}</strong></td>
                                            <td style={{ minWidth: '220px' }}>{request.reason || '-'}</td>
                                            <td>
                                                <span className={
                                                    request.status === 'APPROVED'
                                                        ? styles.approvedBadge
                                                        : request.status === 'REJECTED'
                                                            ? styles.rejectedBadge
                                                            : styles.pendingBadge
                                                }>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td>{new Date(request.createdAt).toLocaleString()}</td>
                                            <td>{request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : '-'}</td>
                                            <td>
                                                <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                                                    {request.status === 'PENDING' ? (
                                                        <>
                                                            <button
                                                                className={styles.approveBtn}
                                                                onClick={() => handleReviewCreditRequest(request.id, 'APPROVE')}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className={styles.rejectBtn}
                                                                onClick={() => handleReviewCreditRequest(request.id, 'REJECT')}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{request.adminNote || '-'}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                No credit requests found for this filter.
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
                                            const items = document.querySelectorAll<HTMLElement>(`.${styles.planEditor}[data-type]`);
                                            items.forEach((item) => {
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

                {activeTab === 'blogs' && (
                    <div className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Blog Management</h3>
                            <button
                                className={styles.saveBtn}
                                onClick={() => router.push('/admin/blog')}
                            >
                                + Create New Blog
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Created At</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blogs.length > 0 ? blogs.map((blog) => (
                                        <tr key={blog.id}>
                                            <td>{blog.title}</td>
                                            <td>{new Date(blog.createdAt).toLocaleDateString()} at {new Date(blog.createdAt).toLocaleTimeString()}</td>
                                            <td>
                                                <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                                                    <button
                                                        className={styles.editBtn}
                                                        onClick={() => router.push(`/admin/blog?id=${blog.id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDeleteBlog(blog.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                                No blogs found. Start by creating one!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}
