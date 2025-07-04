// lib/middleware-utils.ts
import { NextRequest, NextResponse } from 'next/server';
import type { Locale } from '@/lib/types';

// IP utilities
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Rate limiting utilities
export interface RateLimitConfig {
  limit: number;
  window: number; // in milliseconds
}

export class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  isLimited(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.store.get(key);
    
    if (!entry || now > entry.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + config.window });
      return false;
    }
    
    if (entry.count >= config.limit) {
      return true;
    }
    
    entry.count++;
    return false;
  }
  
  getRemainingAttempts(key: string, config: RateLimitConfig): number {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return config.limit;
    }
    
    return Math.max(0, config.limit - entry.count);
  }
  
  getResetTime(key: string): number | null {
    const entry = this.store.get(key);
    return entry ? entry.resetTime : null;
  }
  
  clear(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}

// Security headers utilities
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Remove server information
  response.headers.delete('x-powered-by');
  
  // Basic security headers
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('x-xss-protection', '1; mode=block');
  
  // Permissions Policy
  const permissionsPolicy = [
    'camera=(),',
    'microphone=(),',
    'geolocation=(self),',
    'payment=(self),',
    'usb=()',
  ].join(' ');
  
  response.headers.set('permissions-policy', permissionsPolicy);
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://uploads.stripe.com",
    "frame-src 'self' https://www.google.com https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('content-security-policy', csp);
  
  // HSTS header for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

// Locale utilities
export function getLocaleFromPath(pathname: string, supportedLocales: Locale[]): Locale | null {
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  return supportedLocales.includes(maybeLocale as Locale) ? maybeLocale as Locale : null;
}

export function removeLocaleFromPath(pathname: string, supportedLocales: Locale[]): string {
  const locale = getLocaleFromPath(pathname, supportedLocales);
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/';
  }
  return pathname;
}

export function addLocaleToPath(pathname: string, locale: Locale, defaultLocale: Locale): string {
  if (locale === defaultLocale) {
    return pathname;
  }
  return `/${locale}${pathname}`;
}

export function detectLocaleFromHeaders(
  request: NextRequest,
  supportedLocales: Locale[],
  defaultLocale: Locale
): Locale {
  const acceptLanguage = request.headers.get('accept-language');
  
  if (!acceptLanguage) {
    return defaultLocale;
  }
  
  const preferredLocale = acceptLanguage
    .split(',')
    .map(lang => lang.trim().split('-')[0])
    .find(lang => supportedLocales.includes(lang as Locale));
  
  return (preferredLocale as Locale) || defaultLocale;
}

// Bot detection utilities
export function isBot(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'whatsapp',
    'telegram',
    'skype',
    'googlebot',
    'bingbot',
    'yandexbot',
    'baiduspider',
    'slackbot',
    'discordbot'
  ];
  
  return botPatterns.some(pattern => userAgent.includes(pattern));
}

// Geolocation utilities
export function getCountryFromRequest(request: NextRequest): string | null {
  // Cloudflare
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX') {
    return cfCountry;
  }
  
  // AWS CloudFront
  const awsCountry = request.headers.get('cloudfront-viewer-country');
  if (awsCountry) {
    return awsCountry;
  }
  
  // Vercel
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  if (vercelCountry) {
    return vercelCountry;
  }
  
  return null;
}

// Error response utilities
export function createErrorResponse(
  error: { code: string; message: string },
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error
    },
    { status }
  );
}

export function createRateLimitResponse(
  resetTime?: number
): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests'
      }
    },
    { status: 429 }
  );
  
  if (resetTime) {
    response.headers.set('retry-after', Math.ceil((resetTime - Date.now()) / 1000).toString());
  }
  
  return response;
}

// Path matching utilities
export function matchesPath(pathname: string, pattern: string): boolean {
  if (pattern.endsWith('*')) {
    const basePath = pattern.slice(0, -1);
    return pathname.startsWith(basePath);
  }
  
  return pathname === pattern;
}

export function matchesAnyPath(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => matchesPath(pathname, pattern));
}

// Device detection utilities
export function isMobile(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const mobileRegex = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|webOS/i;
  return mobileRegex.test(userAgent);
}

// Time utilities
export function formatResetTime(resetTime: number): string {
  const seconds = Math.ceil((resetTime - Date.now()) / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

// Request validation utilities
export function validateRequest(request: NextRequest): {
  isValid: boolean;
  error?: string;
} {
  const contentType = request.headers.get('content-type');
  const method = request.method;
  
  // Check for suspicious requests
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (!contentType) {
      return {
        isValid: false,
        error: 'Content-Type header is required for POST/PUT/PATCH requests'
      };
    }
  }
  
  // Check for excessively large requests
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return {
      isValid: false,
      error: 'Request too large'
    };
  }
  
  return { isValid: true };
}

// Cookie utilities
export function getCookieLocale(request: NextRequest, supportedLocales: Locale[]): Locale | null {
  const cookieLocale = request.cookies.get('locale')?.value;
  
  if (cookieLocale && supportedLocales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }
  
  return null;
}

export function setLocaleCookie(response: NextResponse, locale: Locale): void {
  response.cookies.set('locale', locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/'
  });
}