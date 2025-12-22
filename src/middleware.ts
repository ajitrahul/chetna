import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

// Protected routes that require authentication
const protectedPaths = [
    "/chart",
    "/clarity",
    "/timing",
    "/synastry",
    "/pricing"
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the path needs authentication
    const isProtectedPath = protectedPaths.some(path =>
        pathname.startsWith(path)
    )

    if (isProtectedPath) {
        const session = await auth()

        if (!session) {
            // Redirect to login with callback URL
            const url = new URL("/login", request.url)
            url.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(url)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - /api/auth (authentication endpoints)
         * - /_next/static (static files)
         * - /_next/image (image optimization files)
         * - /favicon.ico (favicon file)
         * - /public (public files)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
