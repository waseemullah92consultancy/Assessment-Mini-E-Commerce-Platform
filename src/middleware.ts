import { NextRequest, NextResponse } from 'next/server';

const CUSTOMER_PROTECTED = ['/cart', '/checkout', '/orders', '/profile'];
const ADMIN_PREFIX = '/admin';
const AUTH_PREFIX = '/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = request.cookies.has('admin-session');

  // Admin routes — must have admin-session cookie
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If admin tries to access storefront, redirect to admin panel
  if (isAdmin && !pathname.startsWith(AUTH_PREFIX)) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Customer-only routes — must have auth-session cookie
  const isCustomerProtected = CUSTOMER_PROTECTED.some((p) =>
    pathname.startsWith(p),
  );
  if (isCustomerProtected && !request.cookies.has('auth-session')) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/products/:path*',
    '/categories/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
};
