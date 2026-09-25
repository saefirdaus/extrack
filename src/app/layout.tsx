import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getThemePreference } from '@/lib/cookies/preference';
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
  title: 'EXTRACK - Keuangan Mahasiswa',
  description: 'Aplikasi manajemen keuangan pribadi mahasiswa',
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
      className={`${theme === 'dark' ? 'dark ' : ''}${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
