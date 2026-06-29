import { NextRequest, NextResponse } from 'next/server';

const CUSTOMER_PROTECTED = ['/cart', '/checkout', '/orders', '/profile'];
const ADMIN_PREFIX = '/admin';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes — must have admin-session cookie
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!request.cookies.has('admin-session')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
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
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
