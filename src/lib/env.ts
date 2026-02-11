/** Typed environment variables — single source of truth */

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getPublicEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing public environment variable: ${key}`);
  }
  return value;
}

export const env = {
  supabase: {
    url: getPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
  },
  app: {
    url: getPublicEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    name: getPublicEnv("NEXT_PUBLIC_APP_NAME", "PayWise"),
  },
  resend: {
    apiKey: getEnv("RESEND_API_KEY", ""),
  },
  mixpanel: {
    token: getPublicEnv("NEXT_PUBLIC_MIXPANEL_TOKEN", ""),
  },
} as const;
