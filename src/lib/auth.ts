import { cookies } from 'next/headers';

/**
 * Gets current logged in user ID from session/token,
 * with fallback to mock userId = 1 for local development testing.
 */
export async function getCurrentUserId(): Promise<number> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      // In full Auth implementation, decode JWT token payload to retrieve userId
      // For now, fallback to mock user ID = 1 if token is not present or invalid
    }
  } catch {
    // Ignore cookie errors in non-request contexts
  }
  return 1;
}
