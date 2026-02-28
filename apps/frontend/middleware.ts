import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // 1. Logging & Debugging
    console.log(`[Middleware] Checking path: ${pathname} | Token present: ${!!token}`);

    // 2. Identify Request Types
    const isNextInternalRequest = request.headers.get('x-nextjs-data') || pathname.startsWith('/_next');
    const isPublicRoute = pathname === '/login' || pathname === '/register';

    // 3. Safety: If we're already on /login, never redirect TO /login
    if (pathname === '/login') return NextResponse.next();

    // 4. Soften Redirects:
    // Only redirect if:
    // - No token is present
    // - It's NOT a public route
    // - It's NOT an internal Next.js data fetch (don't break hydration/navigation)
    // - Path is a protected area (dashboard, etc)
    if (!token && !isPublicRoute && !isNextInternalRequest && pathname !== '/') {
        console.warn(`[Middleware] No token found for protected path: ${pathname}. Redirecting to /login.`);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 5. Success: Add no-cache headers to prevent stale auth states
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
}

export const config = {
    // Matcher covers all routes except static assets and API
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
