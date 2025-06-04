import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isPublicPath = pathname === '/' || pathname === '/login' || pathname === '/signup';
  const token = request.cookies.get('token')?.value;

  // If trying to access protected route without token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login/signup with token, redirect to home
  if ((pathname === '/login' || pathname === '/signup') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/m-class',
    '/e-class',
    '/my-batches',
    '/api/auth/:path*'
  ]
}; 