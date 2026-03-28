function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  };
}

/**
 * Domain-specific environment variables энд нэмнэ үү.
 * Жишээ:
 *   export function getMyIntegrationEnv() {
 *     return {
 *       apiKey: getRequiredEnv("MY_INTEGRATION_API_KEY"),
 *       baseUrl: process.env.MY_INTEGRATION_BASE_URL ?? "https://api.example.com",
 *     };
 *   }
 */

export function getSocialPayEnv() {
  return {
    baseUrl: process.env.SOCIALPAY_BASE_URL ?? 'https://sandbox.socialpay.mn',
    token: process.env.SOCIALPAY_TOKEN ?? '',
    merchantId: process.env.SOCIALPAY_MERCHANT_ID ?? '',
  };
}
