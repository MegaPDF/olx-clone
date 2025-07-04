import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import type { Locale } from '@/lib/types';

// Configuration
const SUPPORTED_LOCALES: Locale[] = ['en', 'id'];
const DEFAULT_LOCALE: Locale = 'en';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/messages',
  '/my-listings',
  '/favorites',
  '/sell'
];

// Admin routes that require admin role
const ADMIN_ROUTES = [
  '/admin'
];

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/listings',
  '/api/messages',
  '/api/users/profile',
  '/api/favorites',
  '/api/upload'
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/search',
  '/listings',
  '/categories',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/error',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/help'
];

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  '/api/auth/signin': { limit: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  '/api/auth/signup': { limit: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
  '/api/auth/forgot-password': { limit: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
  '/api/listings': { limit: 10, window: 60 * 1000 }, // 10 requests per minute
  '/api/messages': { limit: 30, window: 60 * 1000 }, // 30 requests per minute
};

// Helper functions
function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  return SUPPORTED_LOCALES.includes(maybeLocale as Locale) ? maybeLocale as Locale : null;
}

function removeLocaleFromPath(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/';
  }
  return pathname;
}

function addLocaleToPath(pathname: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) {
    return pathname;
  }
  return `/${locale}${pathname}`;
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

function isProtectedAPIRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(key: string, config: { limit: number; window: number }): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + config.window });
    return false;
  }
  
  if (entry.count >= config.limit) {
    return true;
  }
  
  entry.count++;
  return false;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return 'unknown';
}

// Security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Remove server information
  response.headers.delete('x-powered-by');
  
  // Security headers
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('x-xss-protection', '1; mode=block');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://maps.googleapis.com",
    "frame-src 'self' https://www.google.com https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
  
  response.headers.set('content-security-policy', csp);
  
  return response;
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const currentLocale = getLocaleFromPath(pathname);
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  
  console.log('Middleware:', { pathname, currentLocale, pathWithoutLocale });
  
  // Skip middleware for certain paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitConfig = Object.entries(RATE_LIMIT_CONFIG).find(([route]) => 
      pathname.startsWith(route)
    );
    
    if (rateLimitConfig) {
      const clientIP = getClientIP(request);
      const key = `${clientIP}:${rateLimitConfig[0]}`;
      
      if (isRateLimited(key, rateLimitConfig[1])) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'RATE_LIMIT_EXCEEDED', 
              message: 'Too many requests' 
            } 
          },
          { status: 429 }
        );
      }
    }
  }
  
  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Check if API route requires authentication
    if (isProtectedAPIRoute(pathname)) {
      try {
        const session = await auth();
        
        if (!session?.user) {
          return NextResponse.json(
            { 
              success: false, 
              error: { 
                code: 'UNAUTHORIZED', 
                message: 'Authentication required' 
              } 
            },
            { status: 401 }
          );
        }
        
        // Check admin routes
        if (pathname.startsWith('/api/admin/') && session.user.role !== 'admin') {
          return NextResponse.json(
            { 
              success: false, 
              error: { 
                code: 'FORBIDDEN', 
                message: 'Admin access required' 
              } 
            },
            { status: 403 }
          );
        }
        
        // Add user info to request headers for API routes
        const response = NextResponse.next();
        response.headers.set('x-user-id', session.user.id);
        response.headers.set('x-user-role', session.user.role);
        return addSecurityHeaders(response);
        
      } catch (error) {
        console.error('Auth error in middleware:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'AUTH_ERROR', 
              message: 'Authentication failed' 
            } 
          },
          { status: 500 }
        );
      }
    }
    
    return addSecurityHeaders(NextResponse.next());
  }
  
  // Handle locale detection and redirection
  let targetLocale: Locale = currentLocale || DEFAULT_LOCALE;
  
  // Detect locale from Accept-Language header if not in URL
  if (!currentLocale) {
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')
        .map(lang => lang.trim().split('-')[0])
        .find(lang => SUPPORTED_LOCALES.includes(lang as Locale));
      
      if (preferredLocale) {
        targetLocale = preferredLocale as Locale;
      }
    }
  }
  
  // Get user session for protected routes
  let session: Awaited<ReturnType<typeof auth>> | null = null;
  try {
    if (isProtectedRoute(pathWithoutLocale) || isAdminRoute(pathWithoutLocale)) {
      session = await auth();
    }
  } catch (error) {
    console.error('Session error:', error);
  }
  
  // Handle authentication for protected routes
  if (isProtectedRoute(pathWithoutLocale)) {
    if (!session?.user) {
      const signInUrl = new URL(addLocaleToPath('/auth/signin', targetLocale), request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Check if user account is active
    if (session.user.status === 'suspended') {
      const errorUrl = new URL(addLocaleToPath('/auth/error', targetLocale), request.url);
      errorUrl.searchParams.set('error', 'AccountSuspended');
      return NextResponse.redirect(errorUrl);
    }
  }
  
  // Handle admin routes
  if (isAdminRoute(pathWithoutLocale)) {
    if (!session?.user) {
      const signInUrl = new URL(addLocaleToPath('/auth/signin', targetLocale), request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
    
    if (session.user.role !== 'admin') {
      const errorUrl = new URL(addLocaleToPath('/auth/error', targetLocale), request.url);
      errorUrl.searchParams.set('error', 'AccessDenied');
      return NextResponse.redirect(errorUrl);
    }
  }
  
  // Handle auth pages when user is already logged in
  if (session?.user && ['/auth/signin', '/auth/signup'].includes(pathWithoutLocale)) {
    const dashboardUrl = new URL(addLocaleToPath('/dashboard', targetLocale), request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Handle locale redirection
  if (!currentLocale && targetLocale !== DEFAULT_LOCALE) {
    const redirectUrl = new URL(addLocaleToPath(pathname, targetLocale) + search, request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If current locale is default locale and it's in the URL, redirect to clean URL
  if (currentLocale === DEFAULT_LOCALE && pathname.startsWith('/en')) {
    const redirectUrl = new URL(pathWithoutLocale + search, request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Continue with the request
  const response = NextResponse.next();
  
  // Add locale to headers for the application
  response.headers.set('x-locale', targetLocale);
  
  // Add user info to headers if authenticated
  if (session?.user) {
    response.headers.set('x-user-id', session.user.id);
    response.headers.set('x-user-role', session.user.role);
    response.headers.set('x-user-locale', session.user.preferences.language);
  }
  
  return addSecurityHeaders(response);
}

// Middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};