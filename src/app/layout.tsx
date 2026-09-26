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
  title: 'ExTrack — Financial Terminal',
  description: 'Precision expense tracker and cashflow ledger',
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
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900 transition-colors">
        {children}
      </body>
    </html>
  );
}
