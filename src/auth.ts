import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Email",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) {
                    return null
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isValidPassword) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;

                // Server-side check for admin status
                const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
                const userEmail = session.user.email?.toLowerCase();

                console.log('--- ADMIN CHECK ---');
                console.log('User Email:', userEmail);
                console.log('Admin Emails:', adminEmails);

                session.user.isAdmin = !!userEmail && adminEmails.includes(userEmail);
                console.log('Is Admin:', session.user.isAdmin);
            }
            return session
        },
    },
})

// Add type declaration for isAdmin
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            isAdmin?: boolean;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        }
    }
}
