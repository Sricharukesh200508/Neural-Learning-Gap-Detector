/**
 * Central API base URL.
 * - Locally: http://localhost:8000
 * - Production: set NEXT_PUBLIC_API_URL in Vercel environment variables
 *   to your Render backend URL (e.g. https://devrush-backend.onrender.com)
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
