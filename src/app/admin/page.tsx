
import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/admin';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const isAdmin = await checkAdminAccess();

    if (!isAdmin) {
        redirect('/');
    }

    return <AdminDashboard />;
}
