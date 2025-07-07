/**
 * Environment-aware configuration for VALUES.md
 * Handles local development vs production deployment URLs
 */

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isVercelProduction = process.env.VERCEL_ENV === 'production';

// Base URLs for different environments
export const getBaseUrl = (): string => {
  // Server-side: use environment variables
  if (typeof window === 'undefined') {
    // Use VERCEL_URL for deployments (includes branch deployments)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // Fallback to custom domain if set
    if (isVercelProduction && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    return process.env.SITE_URL || 'http://localhost:3000';
  }
  
  // Client-side: detect from browser
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location;
    return `${protocol}//${host}`;
  }
  
  return 'http://localhost:3000';
};

// API URL builder
export const getApiUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api${path}`;
};

// Page URL builder
export const getPageUrl = (path: string): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};

// NextAuth configuration
export const getNextAuthUrl = (): string => {
  if (isVercelProduction) {
    return 'https://values.md';
  }
  return process.env.NEXTAUTH_URL || getBaseUrl();
};

// Site metadata
export const siteConfig = {
  name: 'VALUES.md',
  description: 'Generate your personalized values.md file through ethical dilemmas to guide AI systems aligned with your principles.',
  url: getBaseUrl(),
  ogImage: `${getBaseUrl()}/api/og`,
  links: {
    github: 'https://github.com/GeorgeStrakhov/values.md',
    docs: `${getBaseUrl()}/docs`,
    blog: `${getBaseUrl()}/blog`,
  },
};

// Environment info for debugging
export const envInfo = {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  baseUrl: getBaseUrl(),
  isDevelopment,
  isProduction,
  isVercelProduction,
};