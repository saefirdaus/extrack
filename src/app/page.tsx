import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ExTrack</h1>
        <p className="text-gray-600 text-sm mb-6">
          Aplikasi Manajemen Keuangan & Arus Kas Mahasiswa
        </p>
        <Link
          href="/dashboard/transactions"
          className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
        >
          Buka Manajemen Transaksi
        </Link>
      </div>
    </div>
  );
}
