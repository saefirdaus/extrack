import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

/**
 * Mengambil ID user yang sedang terotentikasi dari cookie session JWT.
 * Jika tidak terotentikasi, segera arahkan ke halaman login.
 */
export async function getCurrentUserId(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user.id;
}
