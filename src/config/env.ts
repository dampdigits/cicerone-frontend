/**
 * Application environment configuration
 * Sourced dynamically from .env.local, .env, and import.meta.env
 */

export interface AppEnvConfig {
  /**
   * The base URL of the backend Cicerone API (e.g. http://localhost:8000)
   */
  backendDomainUrl: string;

  /**
   * The resolved API URL base (either full domain URL or relative for reverse proxy)
   */
  apiUrl: string;

  /**
   * Optional API key or bearer token for protected backend endpoints
   */
  apiKey?: string;

  /**
   * Authorization header name (defaults to 'Authorization')
   */
  authHeader: string;

  /**
   * Environment flags
   */
  isDevelopment: boolean;
  isProduction: boolean;
}

const rawBackendUrl = (import.meta.env.VITE_BACKEND_DOMAIN_URL || '').trim();
// Strip trailing slashes for clean concatenation
const normalizedBackendUrl = rawBackendUrl.replace(/\/+$/, '');

export const ENV: AppEnvConfig = {
  backendDomainUrl: normalizedBackendUrl || 'http://localhost:8000',
  apiUrl: normalizedBackendUrl,
  apiKey: (import.meta.env.VITE_API_KEY || '').trim() || undefined,
  authHeader: (import.meta.env.VITE_AUTH_HEADER || 'Authorization').trim(),
  isDevelopment: Boolean(import.meta.env.DEV),
  isProduction: Boolean(import.meta.env.PROD),
};
