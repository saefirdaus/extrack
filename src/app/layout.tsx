import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getThemePreference } from '@/src/lib/cookies/preference';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ExTrack - Expense Tracker',
  description: 'Aplikasi Manajemen Transaksi Keuangan Mahasiswa',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemePreference();

  return (
    <html
      lang="id"
      className={`${theme === 'light' ? '' : 'dark '} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
