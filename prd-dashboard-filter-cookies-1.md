# FILE: prd-dashboard-filter-cookies-1.md

# 1. Feature Overview
- **Nama Fitur**: Dashboard Finansial, Filter Transaksi, dan Cookies Preferensi Pengguna.
- **Tujuan Fitur**: Menyajikan ringkasan kondisi keuangan mahasiswa (Nama, Saldo Bersih, Total Pemasukan, Total Pengeluaran, serta 5 Transaksi Terbaru), menyediakan mekanisme filter jenis transaksi (Semua / Pemasukan / Pengeluaran), dan menyimpan preferensi filter tersebut ke dalam cookies browser pengguna.
- **Masalah yang Diselesaikan**: Membantu mahasiswa mengetahui sisa uang dan arus kas secara instan tanpa harus menghitung manual, serta mempertahankan preferensi tampilan filter pengguna setiap kali membuka aplikasi.
- **Pengguna/Aktor**: Mahasiswa terotentikasi.
- **Dependency**: Urutan 1 (Dapat dikerjakan bersamaan dengan PRD Auth dan PRD Transaksi melalui isolasi file eksklusif dan query Drizzle agregasi).
- **Alasan Urutan Implementasi**: Merupakan antarmuka utama yang dilihat pengguna saat pertama kali masuk ke aplikasi setelah login.

---

# 2. User Story
- **US-10 (Dashboard Overview)**: Sebagai mahasiswa, saya ingin melihat nama saya, saldo saat ini, total pemasukan, dan total pengeluaran di halaman dashboard, sehingga saya langsung memahami kesehatan finansial saya.
- **US-11 (Recent Transactions)**: Sebagai mahasiswa, saya ingin melihat 5 transaksi terbaru saya di dashboard, sehingga saya dapat langsung memantau aktivitas transaksi terakhir.
- **US-12 (Filter Transaksi)**: Sebagai mahasiswa, saya ingin memfilter tampilan transaksi berdasarkan jenis (Semua, Hanya Pemasukan, atau Hanya Pengeluaran), sehingga saya dapat fokus mengevaluasi salah satu jenis transaksi.
- **US-13 (Cookies Preferensi)**: Sebagai mahasiswa, saya ingin preferensi filter yang saya pilih tersimpan di cookies, sehingga ketika saya membuka dashboard di lain waktu, filter favorit saya otomatis aktif tanpa perlu memilih ulang.

---

# 3. Scope
## MVP / Required (Harus selesai dalam 60 menit)
- Halaman Utama Dashboard (`/dashboard/page.tsx`).
- Sapaan nama pengguna terotentikasi (`Halo, {userName}!`).
- Tiga Kartu Ringkasan Finansial:
  - **Saldo Saat Ini**: `Total Pemasukan - Total Pengeluaran` (Warna biru/netral).
  - **Total Pemasukan**: Jumlah akumulasi seluruh transaksi `income` (Warna hijau).
  - **Total Pengeluaran**: Jumlah akumulasi seluruh transaksi `expense` (Warna merah).
- Daftar 5 Transaksi Terbaru dengan penanda nominal (`+` hijau atau `-` merah).
- Komponen Tab/Pills Filter Transaksi: `Semua`, `Pemasukan`, `Pengeluaran`.
- Integrasi Cookies Preferensi: Membaca dan menulis cookie `pref_transaction_filter` via Next.js Server Action / cookies API.
- Empty state informatif jika belum ada data transaksi yang tercatat.

## If Time Permits
- Indikator badge *"Preferensi Tersimpan di Cookie"* sebagai umpan balik visual bahwa preferensi berhasil disimpan.
- Quick link tombol *"Lihat Semua Transaksi"* yang mengarah ke `/dashboard/transactions`.

## Out of Scope
- Grafik / Chart analitik visual (misal: Chart.js, Recharts).
- Pemilihan rentang tanggal khusus (custom date picker range).
- Ekspor laporan keuangan ke format PDF / Excel.

---

# 4. Preconditions
- Data transaksi tersimpan di database dengan kolom `user_id`, `type`, `amount`, dan `transaction_date`.
- Identitas user login (`userId`, `userName`) diperoleh dari session helper atau mock ID selama proses development 60 menit.

---

# 5. Main User Flow
1. User masuk ke `/dashboard`.
2. Server Component membaca cookie `pref_transaction_filter` (default: `'all'`).
3. Server Component menjalankan query agregasi Drizzle untuk menghitung `totalIncome`, `totalExpense`, dan `currentBalance = totalIncome - totalExpense` milik `currentUserId`.
4. Server Component mengambil 5 transaksi terbaru milik user sesuai preferensi filter aktif.
5. Halaman dirender menampilkan nama pengguna, 3 kartu ringkasan, tombol filter, dan daftar transaksi terbaru.
6. Saat user mengklik tombol filter lain (misal: **Pengeluaran**), Server Action `saveFilterPreferenceAction` memperbarui cookie `pref_transaction_filter='expense'` dan me-refresh data transaksi di layar.
7. Saat user kembali ke dashboard esok hari, sistem otomatis mengingat pilihan filter **Pengeluaran** dari cookie.

---

# 6. Alternative Flow
- **Belum Ada Transaksi**: Nilai saldo Rp0, total pemasukan Rp0, total pengeluaran Rp0. Daftar transaksi menampilkan pesan empty state: *"Belum ada transaksi yang tercatat."*
- **Pengeluaran Lebih Besar dari Pemasukan (Saldo Negatif)**: Saldo bernilai minus (misal: `- Rp50.000`). Angka saldo diberi aksen warna peringatan (merah/oranye) untuk memberi tahu mahasiswa bahwa kondisi keuangannya defisit.
- **Cookie Rusak / Nilai Tidak Dikenal**: Jika cookie `pref_transaction_filter` bernilai selain `'all'`, `'income'`, atau `'expense'`, sistem otomatis fallback ke nilai aman `'all'`.

---

# 7. Low-Fidelity UI Design

### Halaman Dashboard (`/dashboard`)
```text
+------------------------------------------------------------------------+
| EXTRACK                  [Halo, John Doe!]                  [ Keluar ] |
+------------------------------------------------------------------------+
|                                                                        |
| +-------------------+  +-------------------+  +---------------------+  |
| | Saldo Saat Ini    |  | Total Pemasukan   |  | Total Pengeluaran   |  |
| | Rp 1.475.000      |  | Rp 1.500.000      |  | Rp 25.000           |  |
| +-------------------+  +-------------------+  +---------------------+  |
|                                                                        |
| Filter Transaksi:                                                      |
| [ (•) Semua ]  [ ( ) Pemasukan ]  [ ( ) Pengeluaran ]  (Disimpan Cookie)|
|                                                                        |
| Transaksi Terbaru                               [+ Catat Baru] [Lihat Semua]|
|------------------------------------------------------------------------|
| Tanggal    | Keterangan              | Jenis       | Nominal           |
|------------|-------------------------|-------------|-------------------|
| 25/09/2026 | Makan Siang Warteg      | Pengeluaran | - Rp 25.000       |
| 25/09/2026 | Uang Saku Bulanan       | Pemasukan   | + Rp 1.500.000    |
+------------------------------------------------------------------------+
```

---

# 8. Visual Design & Tailwind Guidance
- **Container**: `max-w-6xl mx-auto px-4 py-8`
- **Grid Kartu Finansial**: `grid grid-cols-1 md:grid-cols-3 gap-6 mb-8`
- **Kartu Saldo**: `bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between`
- **Nilai Saldo Positif**: `text-2xl font-bold text-gray-900 mt-2`
- **Nilai Saldo Negatif**: `text-2xl font-bold text-red-600 mt-2`
- **Kartu Pemasukan**: `bg-green-50/50 rounded-xl p-6 shadow-sm border border-green-100 text-green-700`
- **Kartu Pengeluaran**: `bg-red-50/50 rounded-xl p-6 shadow-sm border border-red-100 text-red-700`
- **Pills/Tab Filter**: `inline-flex bg-gray-100 p-1 rounded-lg text-sm mb-6`
- **Pills Aktif**: `bg-white text-gray-900 shadow-sm font-medium px-3 py-1.5 rounded-md`
- **Pills Non-Aktif**: `text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-md transition`

---

# 9. UI States
- **Initial / Populated State**: Menampilkan 3 kartu metrik finansial terisi dan 5 baris riwayat transaksi terbaru.
- **Empty State**: Tampil jika user belum memiliki transaksi sama sekali (Saldo Rp0 dan banner panduan memulai).
- **Filtered State**: Tabel transaksi hanya menampilkan baris yang sesuai dengan jenis yang dipilih.
- **Deficit Balance State**: Saldo bernilai minus dengan indikator visual teks merah.
- **AJAX Loading State**: **Tidak diperlukan**, karena filter diproses via navigasi Server Action dan SSR Next.js yang instan.

---

# 10. Error Container Specification
- **Database Query Failure**: Jika kalkulasi saldo gagal karena masalah koneksi database, tampilkan fallback banner di bagian atas: `<div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">Gagal memuat ringkasan keuangan. Silakan segarkan halaman.</div>`.
- Tidak ada detail query SQL yang ditampilkan ke pengguna.

---

# 11. Form Specification (Filter & Cookie Preference)
- **Filter Selector**:
  - `name="filter"`, form submission via form action atau link navigasi dengan query params `?filter=all|income|expense`.
  - Input hidden untuk nilai filter.
  - Server Action menuliskan pilihan ke cookie `pref_transaction_filter`.

---

# 12. Frontend Validation
- Validasi pilihan filter pada level UI: hanya menerima opsi `'all'`, `'income'`, atau `'expense'`.

---

# 13. Backend Validation
Divalidasi di Server Action (`src/actions/dashboard.ts`):
- Parameter `filter`: string, wajib salah satu dari `['all', 'income', 'expense']`. Jika nilai di luar opsi ini, otomatis fallback ke `'all'`.

---

# 14. Input Sanitization & XSS Prevention
- Nama pengguna dan deskripsi transaksi selalu dirender menggunakan sintaks JSX standar (`{transaction.description}`) yang otomatis meng-escape karakter berbahaya.

---

# 15. SQL Injection Prevention
- Perhitungan agregasi menggunakan Drizzle ORM:
  ```typescript
  const userTransactions = await db.select()
    .from(transactions)
    .where(eq(transactions.userId, currentUserId));
  ```
- Dilarang membuat raw SQL string concatenation.

---

# 16. Database Design
- Menggunakan data yang sudah ada di tabel `transactions` dan tabel `users`.
- Tidak memerlukan tabel database baru (preferensi pengguna disimpan murni di **Cookies browser**, sesuai spesifikasi requirement praktikum).

---

# 17. Database Constraints
- Mengandalkan constraint `NOT NULL` pada `transactions.amount` dan `transactions.type` untuk memastikan integritas perhitungan saldo.

---

# 18. Foreign Key Behavior
- Mengacu pada relasi `transactions.userId -> users.id` yang sudah didefinisikan di modul transaksi.

---

# 19. Duplicate Handling
- Tidak relevan untuk modul kalkulasi dashboard.

---

# 20. HTTP & Server Action Contract
### Page Request
- **Route**: `GET /dashboard`
- **Query Params (Opsional)**: `?filter=all|income|expense`
- **Cookies**: `pref_transaction_filter`
- **Response**: React Server Component HTML.

### Save Filter Preference Action
- **Action**: `saveFilterPreferenceAction(filterValue: string)`
- **Execution**: Menulis cookie:
  ```typescript
  cookies().set('pref_transaction_filter', filterValue, {
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    path: '/',
    httpOnly: false, // Boleh dibaca client/server
    sameSite: 'lax',
  });
  ```
- **Redirect / Refresh**: `revalidatePath('/dashboard')`.

---

# 21. Controller / Action Responsibilities
- File: `src/actions/dashboard.ts`
- Bertanggung jawab memvalidasi input preferensi filter, memperbarui cookie preferensi pengguna, dan merevalidasi halaman dashboard.

---

# 22. Model / Schema Responsibilities
- Menggunakan skema yang diekspor dari `src/db/schema/transactions.ts` dan `src/db/schema/users.ts`.

---

# 23. Authorization
- **Owner Isolation**: Semua data transaksi yang ditarik untuk kalkulasi total dan saldo WAJIB difilter berdasarkan `currentUserId`. Pengguna dilarang keras melihat saldo atau ringkasan transaksi milik pengguna lain.

---

# 24. CSRF
- Dilindungi secara bawaan oleh Next.js Server Actions.

---

# 25. Mass Assignment Protection
- Tidak ada operasi mutasi data sensitif di modul dashboard.

---

# 26. Error Handling
- Jika user belum login, middleware otomatis mengarahkan ke `/login`.
- Jika data kosong, tampilkan nilai default `0` dan empty state tanpa memunculkan runtime error.

---

# 27. Transactions
- Operasi read-only tidak memerlukan database transaction.

---

# 28. Race Conditions
- Tidak ada race condition penulisan data pada dashboard overview.

---

# 29. Delete Behavior
- Tidak ada operasi penghapusan data di modul ini.

---

# 30. Empty State
- **Kondisi**: Ketika user belum memiliki transaksi (`transactions.length === 0`).
- **Tampilan**:
  - Saldo Saat Ini: `Rp 0`
  - Total Pemasukan: `Rp 0`
  - Total Pengeluaran: `Rp 0`
  - Container pesan: *"Belum ada riwayat transaksi. Klik tombol di bawah untuk mencatat pemasukan atau pengeluaran pertama Anda."*
  - Tombol aksi: `[+ Catat Transaksi Baru]` yang mengarah ke `/dashboard/transactions/new`.

---

# 31. Pagination
- Pada dashboard overview, daftar dibatasi secara eksplisit **5 transaksi terbaru** (`limit(5)`).

---

# 32. Search / Filter
- **Mekanisme Filter**:
  - Opsi: `all` (Semua), `income` (Pemasukan), `expense` (Pengeluaran).
  - Mengubah tampilan 5 transaksi terbaru sesuai jenis yang dipilih.
  - Pilihan aktif disimpan ke dalam cookie `pref_transaction_filter`.

---

# 33. Accessibility Minimum
- Kontras warna teks pada kartu metrik memenuhi standar keterbacaan (angka hijau di latar hijau muda, angka merah di latar merah muda).
- Teks sapaan menggunakan heading semantik `<h1>`.

---

# 34. Responsive Behavior
- 3 Kartu Ringkasan Finansial:
  - Mobile: Ditumpuk vertikal 1 kolom (`grid-cols-1`).
  - Tablet/Desktop: Ditata mendatar 3 kolom (`md:grid-cols-3`).

---

# 35. Edge Cases
- **Pemasukan Rp0, Pengeluaran Rp100.000**: Saldo menjadi `- Rp 100.000` (ditampilkan dengan tanda minus yang jelas).
- **Nilai Cookie Kosong / Pertama Kali Buka**: Sistem membaca cookie `undefined` dan secara mulus menggunakan default value `'all'`.

---

# 36. Security Checklist
- [x] Perhitungan saldo hanya melibatkan transaksi milik `currentUserId`.
- [x] Cookie preferensi tidak menyimpan informasi rahasia atau identitas kredensial.
- [x] Angka nominal diformat secara aman tanpa kerentanan XSS.
- [x] Proteksi rute aktif melalui verifikasi token session.

---

# 37. Testing Strategy
## Happy Path
- User memiliki pemasukan Rp500.000 dan pengeluaran Rp200.000 -> Dashboard menampilkan Saldo Rp300.000, Pemasukan Rp500.000, Pengeluaran Rp200.000.
- Mengubah filter ke "Pengeluaran" -> Transaksi terbaru hanya menampilkan pengeluaran.
- Refresh halaman browser -> Filter "Pengeluaran" tetap aktif karena tersimpan di cookies.

## Edge Case Test
- User baru tanpa transaksi -> Dashboard menampilkan Rp0 tanpa error kalkulasi `NaN` atau `undefined`.

---

# 38. Acceptance Criteria
- [ ] Dashboard menampilkan nama pengguna yang sedang login.
- [ ] Dashboard menampilkan Saldo Saat Ini, Total Pemasukan, dan Total Pengeluaran dengan benar.
- [ ] Dashboard menampilkan daftar 5 transaksi terbaru.
- [ ] Pengguna dapat memfilter transaksi berdasarkan jenis (Semua / Pemasukan / Pengeluaran).
- [ ] Preferensi filter tersimpan di cookies dan tetap bertahan saat halaman dimuat ulang.

---

# 39. Definition of Done
- Halaman `src/app/dashboard/page.tsx` selesai dan menampilkan seluruh metrik.
- Komponen `src/components/dashboard/summary-cards.tsx` dan `recent-transactions-list.tsx` selesai dibuat.
- Utility cookie di `src/lib/cookies/preference.ts` berfungsi membaca dan menulis cookie preferensi.
- Seluruh acceptance criteria lolos pengujian.

---

# 40. Implementation Order Inside Feature
1. Buat helper cookie di `src/lib/cookies/preference.ts`.
2. Buat fungsi kalkulasi saldo dan ringkasan di `src/actions/dashboard.ts`.
3. Buat komponen kartu saldo di `src/components/dashboard/summary-cards.tsx`.
4. Buat komponen filter selector di `src/components/dashboard/filter-selector.tsx`.
5. Buat komponen daftar transaksi terbaru di `src/components/dashboard/recent-transactions-list.tsx`.
6. Rakit seluruh komponen di halaman `src/app/dashboard/page.tsx`.
7. Pengujian manual kalkulasi finansial dan persistensi cookie.

---

# 41. Estimated 60-Minute Breakdown
- **00–15 min**: Pembuatan logika kalkulasi saldo, total pemasukan, dan total pengeluaran di server component / action.
- **15–30 min**: Pembuatan komponen kartu metrik finansial (`summary-cards.tsx`) dengan Tailwind CSS.
- **30–45 min**: Pembuatan komponen daftar 5 transaksi terbaru dan penanganan empty state.
- **45–55 min**: Implementasi tombol filter dan persistensi cookie `pref_transaction_filter`.
- **55–60 min**: Pengujian responsivitas dan verifikasi persistensi reload browser.

---

# 42. Explicit Non-Requirements
- Tidak ada chart / grafik batang visual interaktif.
- Tidak ada penyimpanan preferensi ke database (cukup di Cookies browser).
- Tidak ada export data (CSV/PDF).

---

# EKSKLUSIVITAS FILE (ZERO MERGE CONFLICT)
Programmer yang mengerjakan PRD ini **HANYA** membuat dan mengedit file berikut:
- `src/lib/cookies/preference.ts`
- `src/actions/dashboard.ts`
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/summary-cards.tsx`
- `src/components/dashboard/recent-transactions-list.tsx`
- `src/components/dashboard/filter-selector.tsx`
*(Dilarang mengedit file di folder `(auth)` atau folder `dashboard/transactions/`)*
