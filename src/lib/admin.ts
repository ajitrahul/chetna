
import { auth } from '@/auth';

export async function isAdmin(email?: string | null): Promise<boolean> {
    if (!email) return false;

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    return adminEmails.includes(email.toLowerCase());
}

export async function checkAdminAccess() {
    const session = await auth();
    if (!session?.user?.email) return false;
    return isAdmin(session.user.email);
}
