import { cookies } from 'next/headers';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export const MOCK_USER: SessionUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@kampus.ac.id',
};

/**
 * Mendapatkan identitas user terotentikasi.
 * Mengembalikan user dari token session (jika ada) atau mock user untuk pengujian development.
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (authToken) {
    try {
      // Decode payload token sederhana (jika JWT base64) tanpa library berat
      const parts = authToken.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        if (payload && (payload.userId || payload.id)) {
          return {
            id: Number(payload.userId || payload.id),
            name: payload.name || 'Mahasiswa',
            email: payload.email || '',
          };
        }
      }
    } catch {
      // Abaikan parse error, fallback ke mock user
    }
  }

  return MOCK_USER;
}
