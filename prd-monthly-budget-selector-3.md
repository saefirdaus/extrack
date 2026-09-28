# FILE: prd-monthly-budget-selector-3.md

# 1. Feature Overview
- **Nama Fitur**: Pemilahan & Navigasi Anggaran Berdasarkan Bulan (Monthly Budget Selector & Period Navigation).
- **Tujuan Fitur**: Menyediakan antarmuka interaktif bagi pengguna untuk memilih, memilah, dan berpindah antar periode bulan dan tahun (misal: "September 2026", "Oktober 2026") sehingga data batas anggaran, ringkasan pengeluaran, indikator status, serta daftar transaksi dapat dievaluasi secara spesifik per bulan.
- **Masalah yang Diselesaikan**: Tanpa pemilahan bulan, seluruh perhitungan keuangan akan tercampur atau hanya terbatas pada bulan berjalan saat ini, sehingga pengguna tidak dapat mengevaluasi efektivitas anggaran pada bulan-bulan sebelumnya maupun merencanakan anggaran bulan mendatang.
- **Pengguna/Aktor**: Mahasiswa / Pengguna terotentikasi.
- **Dependency**: Urutan 3 (Bergantung pada `prd-set-anggaran-bulanan-2.md` dan `prd-budget-summary-indikator-2.md`).
- **Alasan Urutan Implementasi**: Komponen pemilahan bulan membutuhkan komponen penyaji data (summary & indikator) dan entitas penyimpanan anggaran yang sudah siap sebelum dapat dinavigasikan.

---

# 2. User Story
- **US-B08 (Pilih Bulan & Tahun)**: Sebagai pengguna, saya ingin dapat memilih bulan dan tahun tertentu melalui dropdown atau tombol navigasi (sebelumnya/berikutnya), sehingga saya dapat melihat performa anggaran pada bulan yang saya minati.
- **US-B09 (Pemilahan Otomatis)**: Sebagai pengguna, saat saya berpindah bulan, saya ingin ringkasan anggaran, pengeluaran, progress bar, dan transaksi otomatis terfilter sesuai bulan terpilih tanpa perlu me-refresh halaman secara penuh.
- **US-B10 (Indikator Bulan Aktif)**: Sebagai pengguna, saya ingin memiliki tombol pintas "Bulan Ini" agar saya dapat langsung kembali ke periode bulan sekarang dengan satu klik.

---

# 3. Scope
## MVP / Required (Harus selesai dalam 60 menit)
- Komponen Pemilih Bulan (`MonthSelector` / `PeriodNavigator`):
  - Tombol Navigasi Cepat: **[ < Bulan Sebelumnya ]** dan **[ Bulan Berikutnya > ]**.
  - Dropdown / Pemilih Cepat: Pilihan Nama Bulan (Januari s/d Desember) dan Tahun.
  - Tombol Pintas **"Bulan Ini"** jika periode yang sedang dilihat bukan bulan kalender berjalan.
- Integrasi Query Parameter URL (`/dashboard?month=10&year=2026`):
  - Sinkronisasi state periode berbasis URL query search params menggunakan Next.js `useRouter` dan `useSearchParams`.
  - Bersifat bookmarkable dan mendukung navigasi tombol browser Back/Forward.
- Pemilahan Data Terintegrasi:
  - Mengirim parameter `month` dan `year` ke fungsi agregasi `getMonthlyBudgetSummary`.
  - Mengirim parameter `month` dan `year` ke komponen `RecentTransactionsList` untuk memilah hanya transaksi yang terjadi pada bulan terpilih.
- Validasi parameter numerik bulan (1-12) dan tahun (2020-2099) dengan fallback aman ke bulan berjalan jika parameter URL tidak valid.

## If Time Permits
- Penyimpanan preferensi bulan terakhir yang dilihat ke dalam Cookie pengguna (`pref_budget_period`).
- Ringkasan komparasi mini (misal: "Pengeluaran 12% lebih hemat dibandingkan bulan lalu").

## Out of Scope
- Pemilihan rentang tanggal kustom (custom date range multi-bulan).
- Kalender tampilan matriks penuh (Full Calendar view).
- Laporan komparasi tahunan multi-kolom.

---

# 4. Preconditions
- Fitur `prd-set-anggaran-bulanan-2.md` dan `prd-budget-summary-indikator-2.md` telah terpasang dan dapat menerima parameter `month` dan `year`.
- Transaksi pada tabel `transactions` memiliki format tanggal ISO `YYYY-MM-DD`.

---

# 5. Main User Flow
1. Pengguna berada di halaman dashboard `/dashboard`. Secara default sistem menampilkan bulan dan tahun saat ini (misal: Oktober 2026).
2. Pengguna mengklik tombol **[ < ]** (Bulan Sebelumnya) pada komponen `MonthSelector`.
3. Client Component `MonthSelector` menghitung bulan target (misal: September 2026) dan memperbarui URL menjadi `/dashboard?month=9&year=2026` via Next.js navigation tanpa full-page reload.
4. Server Component `DashboardPage` mendeteksi perubahan `searchParams`, memvalidasi parameter bulan=9 dan tahun=2026.
5. Server Component mengambil data agregasi anggaran dan transaksi milik `currentUserId` khusus untuk bulan September 2026.
6. Halaman me-render ulang section anggaran dan riwayat transaksi untuk menampilkan data bulan September 2026.
7. Tombol pintas **"Kembali ke Bulan Ini"** muncul karena periode yang dilihat bukan bulan berjalan.
8. Pengguna mengklik tombol **"Kembali ke Bulan Ini"**, URL kembali ke `/dashboard`, dan data bulan Oktober kembali disajikan.

---

# 6. Alternative Flow
- **AF-01: Parameter URL Dimanipulasi Pengguna (e.g. `?month=99&year=abcd`)**:
  - Logika validasi di Server Component mendeteksi nilai invalid, secara otomatis mengabaikan parameter manipulatif tersebut, dan menerapkan fallback ke bulan serta tahun saat ini tanpa menampilkan crash error.
- **AF-02: Bulan yang Dipilih Belum Memiliki Catatan Transaksi Maupun Anggaran**:
  - Komponen anggaran menampilkan empty state: *"Belum ada anggaran untuk September 2026"*.
  - Tabel transaksi menampilkan empty state: *"Tidak ada transaksi pada bulan ini"*.
  - Pengguna tetap dapat mengklik tombol "Tetapkan Anggaran" untuk langsung membuat anggaran pada bulan tersebut.

---

# 7. Low-Fidelity UI Design
```text
+--------------------------------------------------------------------------+
|  [ < ]   Oktober 2026   [ > ]                     [ Kembali ke Bulan Ini ] |
+--------------------------------------------------------------------------+
|                                                                          |
|  [ KARTU RINGKASAN ANGGARAN OKTOBER 2026 ]                               |
|  Total Anggaran: Rp 1.500.000  |  Pengeluaran: Rp 975.000  | Sisa: Rp 525k|
|  Progress: [=====================-----------------] 65% (Waspada)        |
|                                                                          |
+--------------------------------------------------------------------------+
|  DAFTAR TRANSAKSI (Oktober 2026)                                         |
|  - 14 Okt: Pembelian Buku Kuliah                     - Rp 120.000        |
|  - 08 Okt: Makan Siang Kantin                        - Rp 25.000         |
|  - 02 Okt: Kiriman Uang Bulanan                      + Rp 1.500.000      |
+--------------------------------------------------------------------------+
```

### Component Decomposition
```text
DashboardPage (Server Component)
├── MonthSelectorBar (Client Component) — navigasi prev/next, dropdown bulan/tahun, push query param
├── BudgetSection (Server Component) — menerima props month & year, query data terisolasi
└── RecentTransactionsList (Server Component) — memilah transaksi berdasarkan rentang tanggal bulan aktif
```

---

# 8. Visual Design & Tailwind Guidance
- **Navigator Container**: `flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs mb-4`
- **Nav Buttons ([ < ] dan [ > ])**: `p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer`
- **Active Month Label**: `text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight px-2`
- **Reset to Current Month Badge**: `text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline cursor-pointer transition-colors`

---

# 9. UI States
- **Current Month State**: Label menampilkan nama bulan saat ini. Tombol "Kembali ke Bulan Ini" disembunyikan.
- **Historical / Future Month State**: Menampilkan nama bulan yang dipilih. Tombol "Kembali ke Bulan Ini" aktif terlihat.
- **Navigating / Transitioning State**: Tombol panah dinonaktifkan sesaat (`disabled={isPending}`) untuk mencegah multi-click navigation yang berlebihan.
- **Empty Month State**: Indikator anggaran dan tabel transaksi menampilkan pesan empty state yang informatif.

---

# 10. Error Container Specification
- Jika terjadi kegagalan parsing query parameter URL, error ditangani secara *silent recovery* menggunakan default nilai kalender hari ini (graceful fallback).
- Tidak ada error container merah yang mengganggu pengguna karena sistem secara otomatis melakukan pemulihan (*self-healing parameters*).

---

# 11. Form Specification
- Tidak ada form input teks panjang.
- Kontrol navigasi menggunakan event `onClick` pada tombol panah dan pilihan `<select>` bulan (nilai 1-12) serta tahun (nilai integer 2020-2030).

---

# 12. Frontend Validation
```typescript
// Validasi navigasi client-side
export function getAdjacentMonth(currentMonth: number, currentYear: number, direction: 'prev' | 'next') {
  if (direction === 'prev') {
    return currentMonth === 1
      ? { month: 12, year: currentYear - 1 }
      : { month: currentMonth - 1, year: currentYear };
  } else {
    return currentMonth === 12
      ? { month: 1, year: currentYear + 1 }
      : { month: currentMonth + 1, year: currentYear };
  }
}
```

---

# 13. Backend Validation
Validasi parameter URL di Server Component:
```typescript
export function parseMonthYearParams(searchParams?: { month?: string; year?: string }) {
  const now = new Date();
  const defaultMonth = now.getMonth() + 1;
  const defaultYear = now.getFullYear();

  const parsedMonth = parseInt(searchParams?.month ?? '', 10);
  const parsedYear = parseInt(searchParams?.year ?? '', 10);

  const month = !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : defaultMonth;
  const year = !isNaN(parsedYear) && parsedYear >= 2020 && parsedYear <= 2099 ? parsedYear : defaultYear;

  const isCurrentMonth = month === defaultMonth && year === defaultYear;

  return { month, year, isCurrentMonth };
}
```

---

# 14. Input Sanitization & XSS Prevention
- Parameter query URL `month` dan `year` diproses menggunakan `parseInt(..., 10)` dengan radix basis 10.
- Tidak ada teks yang disuntikkan ke dalam query database tanpa konversi integer terlebih dahulu.

---

# 15. SQL Injection Prevention
- Drizzle query builder memanfaatkan parameter bertipe `integer` murni untuk `month` dan `year` pada query anggaran:
```typescript
where(and(eq(budgets.userId, userId), eq(budgets.month, month), eq(budgets.year, year)))
```

---

# 16. Database Design
- Menggunakan tabel `budgets` dan `transactions` yang telah ada.
- Tidak diperlukan tabel baru.

---

# 17. Database Constraints
- Mengandalkan constraint yang ada pada tabel `budgets` dan `transactions`.

---

# 18. Foreign Key Behavior
- Mengandalkan relasi `ON DELETE CASCADE` yang sudah berjalan.

---

# 19. Duplicate Handling
- N/A (Operasi pembacaan dan filter).

---

# 20. HTTP Contract
- URL Routing:
  `GET /dashboard?month={1..12}&year={2020..2099}`
- Response: HTML / React Server Component Stream yang merender halaman dashboard terfilter sesuai bulan.

---

# 21. Route Handler / Server Action Responsibilities
- Server Component membaca searchParams dari request context, memvalidasi integritas data, dan meneruskannya ke fungsi pengambil data `getDashboardData(userId, filter, month, year)`.

---

# 22. Drizzle Schema Responsibilities
- Menggunakan skema yang ada.

---

# 23. Authorization
- **Owner Isolation**: Parameter `month` dan `year` hanya memfilter data milik `currentUserId` yang sedang terautentikasi melalui cookie session. Tidak ada data pengguna lain yang dapat terekspos saat menjelajahi bulan yang berbeda.

---

# 24. JWT Authentication
- Proteksi otorisasi ditangani di layout `/dashboard/layout.tsx` dan `page.tsx` via `getCurrentUser()`.

---

# 25. Request Body Protection
- N/A (Hanya menggunakan query URL string GET).

---

# 26. Error Handling
- Parameter di luar batas otomatis diarahkan kembali ke bulan berjalan.

---

# 27. Transactions
- N/A (Read-only navigation).

---

# 28. Race Conditions
- Navigasi cepat tombol panah dibatasi menggunakan `isPending` dari React hook `useTransition` sehingga request sebelumnya dibatalkan atau diselesaikan secara teratur.

---

# 29. Delete Behavior
- N/A.

---

# 30. Empty State
- Jika pada bulan yang dipilih tidak ada data transaksi maupun anggaran:
  - Tampilkan kartu anggaran dengan nominal Rp 0 dan tombol "Tetapkan Anggaran untuk [Nama Bulan] [Tahun]".
  - Tampilkan tabel transaksi dengan pesan "Belum ada transaksi di bulan [Nama Bulan] [Tahun]".

---

# 31. Pagination
- Pagination belum diperlukan pada MVP.

---

# 32. Search / Filter
- Fitur ini merupakan komponen filter temporal utama untuk memilah data keuangan berdasarkan siklus kalender bulanan.

---

# 33. Accessibility Minimum
- Tombol panah navigasi memiliki atribut `aria-label`:
  `aria-label="Pindah ke bulan sebelumnya"` dan `aria-label="Pindah ke bulan berikutnya"`.
- Indikator bulan aktif memiliki penanda semantis yang jelas untuk screen reader.

---

# 34. Responsive Behavior
- Desktop: Selector bulan, tombol panah, dan tombol reset "Bulan Ini" berada dalam satu baris fleksibel.
- Mobile: Baris terbagi rapi dengan tombol panah mudah disentuh (`touch target >= 44px`).

---

# 35. Edge Cases
- **Pergantian Tahun (Desember -> Januari)**: Dari bulan 12 tahun 2026, menekan tombol `>` menghasilkan bulan 1 tahun 2027.
- **Pergantian Tahun Mundur (Januari -> Desember)**: Dari bulan 1 tahun 2026, menekan tombol `<` menghasilkan bulan 12 tahun 2025.
- **Format Tanggal Transaksi Bulan 1 Digit**: Tanggal ISO memerlukan zero-padding dua digit (`01`, `02`, ..., `09`), logika pembuatan query string wajib memastikan format `YYYY-MM-DD` terbentuk dengan benar (misal: `2026-09-01`).

---

# 36. Security Checklist
- [x] Parameter query URL divalidasi integer dengan fallback aman.
- [x] Tidak ada potensi Open Redirect.
- [x] Otorisasi `userId` tetap terjaga saat berpindah antar periode bulan.
- [x] Nilai bulan dibatasi antara 1 s/d 12.
- [x] Nilai tahun dibatasi antara 2020 s/d 2099.

---

# 37. Testing Strategy
- **Navigation Next Test**: Berada di Oktober 2026 -> Klik `>` -> URL menjadi `?month=11&year=2026` -> Data November ditampilkan.
- **Navigation Prev Test (Year Wrap)**: Berada di Januari 2026 -> Klik `<` -> URL menjadi `?month=12&year=2025` -> Data Desember 2025 ditampilkan.
- **Reset Button Test**: Berada di Agustus 2026 -> Klik "Kembali ke Bulan Ini" -> URL kembali ke bulan berjalan.
- **Sanitization Test**: Akses URL `?month=inject&year=99999` -> Sistem otomatis fallback ke bulan dan tahun sekarang tanpa error.

---

# 38. Acceptance Criteria
- [ ] Pengguna dapat berpindah ke bulan sebelumnya dan bulan berikutnya menggunakan tombol panah navigasi.
- [ ] Label menampilkan nama bulan dan tahun aktif dengan format bahasa Indonesia yang tepat.
- [ ] Ringkasan anggaran dan riwayat transaksi otomatis tersaring sesuai bulan yang dipilih.
- [ ] Tombol "Kembali ke Bulan Ini" muncul saat melihat bulan lampau atau bulan mendatang dan berfungsi dengan benar.
- [ ] Parameter URL yang tidak valid secara otomatis dipulihkan ke bulan berjalan tanpa menyebabkan server error.

---

# 39. Definition of Done
- Komponen `MonthSelector` terpasang di dashboard dan terhubung dengan URL query parameters.
- Query data di `DashboardPage` menerima dan menerapkan filter `month` dan `year`.
- Transisi antar bulan berjalan mulus tanpa full page refresh.
- Seluruh edge cases pergantian tahun teruji dengan baik.

---

# 40. Implementation Order Inside Feature
1. Buat utility parser dan helper tanggal di `src/lib/date.ts` (`parseMonthYearParams`, `getAdjacentMonth`, `formatMonthName`).
2. Buat Client Component `MonthSelector` dengan hook `useRouter`, `useSearchParams`, dan `useTransition`.
3. Perbarui `src/app/dashboard/page.tsx` untuk membaca `searchParams` (`month` dan `year`).
4. Teruskan parameter `month` dan `year` ke fungsi `getDashboardData` dan `getMonthlyBudgetSummary`.
5. Uji navigasi maju/mundur bulan dan pergantian tahun.

---

# 41. Estimated 60-Minute Breakdown
```text
0–15 menit: Helper fungsi tanggal + parser URL searchParams dengan fallback aman
15–30 menit: Komponen Client MonthSelector (tombol panah, label nama bulan, tombol reset)
30–45 menit: Integrasi searchParams di dashboard/page.tsx dan penerusan ke query agregasi
45–55 menit: Integrasi pemilahan transaksi bulanan dan penyesuaian empty state
55–60 menit: Pengujian pergantian tahun (Desember-Januari) dan penanganan URL manipulasi
```

---

# 42. Explicit Non-Requirements
- Tidak diperlukan date range picker bebas multi-hari.
- Tidak diperlukan sinkronisasi kalender Google Calendar / Outlook.
- Tidak diperlukan fitur arsip PDF laporan bulanan.
