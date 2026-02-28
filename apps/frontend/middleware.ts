import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    console.log(`[Middleware] Checking path: ${pathname} | Token present: ${!!token}`);

    // Define public routes
    const isPublicRoute = pathname === '/login' || pathname === '/register';

    // 1. Safety: If we're already on /login, never redirect TO /login
    if (pathname === '/login') return NextResponse.next();

    // 2. Protect Dashboard: If no token, redirect to login
    if (!token && !isPublicRoute && pathname !== '/') {
        console.warn(`[Middleware] No token found for protected path: ${pathname}. Redirecting to /login.`);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Prevent Login access if already authenticated
    if (token && isPublicRoute) {
        console.log(`[Middleware] Authenticated user on public route. Redirecting to /dashboard.`);
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
