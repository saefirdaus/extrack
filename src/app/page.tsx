import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-950 p-6 text-center">
      <div className="max-w-md w-full bg-zinc-900/90 rounded-3xl shadow-2xl border border-zinc-800/80 p-8 backdrop-blur-xl">
        <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-blue-400">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-2">ExTrack</h1>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Platform Manajemen Keuangan & Arus Kas Mahasiswa (Dark Mode)
        </p>
        <Link
          href="/dashboard/transactions"
          className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/25 active:scale-95"
        >
          Buka Manajemen Transaksi
        </Link>
      </div>
    </div>
  );
}
