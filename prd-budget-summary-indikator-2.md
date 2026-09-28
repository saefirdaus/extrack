# FILE: prd-budget-summary-indikator-2.md

# 1. Feature Overview
- **Nama Fitur**: Ringkasan & Indikator Status Anggaran Bulanan (Budget Summary & Visual Indicator).
- **Tujuan Fitur**: Menghitung secara otomatis dan menampilkan metrik keuangan bulanan pengguna yang mencakup Total Plafon Anggaran, Total Pengeluaran Riil (aktual dari transaksi `expense`), Sisa Anggaran, serta indikator visual tingkat konsumsi anggaran (persentase, progress bar, dan status kategori).
- **Masalah yang Diselesaikan**: Pengguna tidak dapat mengetahui secara langsung seberapa cepat uang mereka habis dalam satu bulan dan sering kali terlambat menyadari kondisi defisit/overbudget.
- **Pengguna/Aktor**: Mahasiswa / Pengguna terotentikasi.
- **Dependency**: Urutan 2 (Bergantung pada `prd-autentikasi-session-1.md` untuk identitas user, `prd-manajemen-transaksi-1.md` untuk data transaksi pengeluaran, dan berintegrasi dengan skema tabel `budgets` dari `prd-set-anggaran-bulanan-2.md`).
- **Alasan Urutan Implementasi**: Merupakan antarmuka inti pemantauan keuangan yang memproses data dari transaksi dan anggaran untuk divisualisasikan kepada pengguna.

---

# 2. User Story
- **US-B04 (Budget Summary)**: Sebagai pengguna, saya ingin melihat kartu ringkasan berisi Total Anggaran, Total Pengeluaran Aktual, dan Sisa Anggaran saya pada bulan berjalan, sehingga saya tahu sisa batas pengeluaran yang masih aman.
- **US-B05 (Visual Progress Indicator)**: Sebagai pengguna, saya ingin melihat indikator batang kemajuan (progress bar) dan persentase penggunaan anggaran yang berubah warna secara dinamis, sehingga saya mendapat peringatan visual instan saat pengeluaran mendekati atau melebihi batas.
- **US-B06 (Status Badge)**: Sebagai pengguna, saya ingin melihat label status penggunaan (Aman / Waspada / Overbudget), sehingga saya dapat mengambil keputusan keuangan dengan cepat.
- **US-B07 (Owner Isolation)**: Sebagai pengguna, saya ingin perhitungan ringkasan pengeluaran dan sisa anggaran hanya mengagregasi transaksi milik saya sendiri.

---

# 3. Scope
## MVP / Required (Harus selesai dalam 60 menit)
- Komponen Kartu Ringkasan Anggaran (`BudgetSummaryCard`):
  - **Plafon Anggaran**: Nominal target anggaran bulan terpilih (dari tabel `budgets`).
  - **Total Pengeluaran**: Akumulasi nominal seluruh transaksi `type = 'expense'` milik user pada rentang tanggal bulan & tahun terpilih.
  - **Sisa Anggaran**: `Plafon Anggaran - Total Pengeluaran`. Jika bernilai negatif, ditandai sebagai defisit (Overbudget).
- Komponen Indikator Visual Penggunaan (`BudgetProgressBar`):
  - Kalkulasi persentase: `(Total Pengeluaran / Plafon Anggaran) * 100%`.
  - Dynamic Progress Bar (lebar maksimal 100% untuk representasi bar):
    - **Aman (Safe)**: Pengeluaran < 70% (Warna Emerald/Hijau).
    - **Waspada (Warning)**: Pengeluaran 70% s/d 99% (Warna Amber/Kuning).
    - **Overbudget (Danger)**: Pengeluaran >= 100% (Warna Rose/Merah).
  - Badge Status Konkret: Label teks "Aman", "Waspada", atau "Overbudget".
- Query Drizzle agregasi efisien dengan filter `and(eq(transactions.userId, currentUserId), eq(transactions.type, 'expense'), gte(transactionDate, startOfMonth), lte(transactionDate, endOfMonth))`.
- Empty state informatif jika pengguna belum menetapkan anggaran pada bulan tersebut.

## If Time Permits
- Tooltip rincian sisa hari dalam bulan berjalan dan rata-rata pengeluaran harian yang disarankan.
- Animasi transisi halus pada progress bar (`transition-all duration-500 ease-out`).

## Out of Scope
- Breakdown anggaran per merchant atau kategori pos belanja.
- Prediksi tren pengeluaran berbasis machine learning.
- Export visualisasi grafik ke format gambar/PDF.

---

# 4. Preconditions
- User telah login dengan sesi JWT aktif (`userId` tersedia).
- Tabel `transactions` dan tabel `budgets` telah terpasang di database PostgreSQL.
- Transaksi pengeluaran tersimpan dengan kolom `transaction_date` yang valid (format ISO YYYY-MM-DD).

---

# 5. Main User Flow
1. Pengguna membuka halaman dashboard `/dashboard`.
2. Server Component membaca parameter bulan dan tahun aktif (default: bulan dan tahun kalender saat ini).
3. Server Component menjalankan query agregasi paralel via Drizzle:
   - Mengambil data `amount` dari tabel `budgets` untuk `(userId, month, year)`.
   - Mengambil jumlah total transaksi `amount` dari tabel `transactions` dengan kriteria `userId = currentUserId`, `type = 'expense'`, dan `transactionDate` berada dalam rentang bulan tersebut.
4. Server menghitung:
   - `totalBudget = budgetData?.amount ?? 0`
   - `totalExpense = sum(expenseAmount)`
   - `remainingBudget = totalBudget - totalExpense`
   - `usagePercentage = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0`
   - Menentukan status badge:
     - Jika `usagePercentage >= 100`: Status **Overbudget** (Merah).
     - Jika `usagePercentage >= 70`: Status **Waspada** (Kuning).
     - Selainnya: Status **Aman** (Hijau).
5. Server Component merender `BudgetSummaryCard` dan `BudgetProgressBar` dengan nilai-nilai terhitung.
6. Pengguna melihat status kesehatan anggarannya secara instan tanpa perlu melakukan kalkulasi manual.

---

# 6. Alternative Flow
- **AF-01: Belum Ada Anggaran Ditetapkan (Budget = 0)**:
  - Sistem menampilkan empty state banner ramah pengguna: *"Anggaran belum ditetapkan untuk bulan ini"* dan menyembunyikan progress bar agar tidak terjadi pembagian dengan nol (*division by zero*). Menampilkan tombol CTA untuk memicu modal penetapan anggaran.
- **AF-02: Pengeluaran Melebihi Anggaran (Overbudget / Sisa Anggaran Negatif)**:
  - Sisa Anggaran ditampilkan dengan warna teks merah dan tanda minus (misal: `- Rp 250.000 (Defisit)`).
  - Progress bar terisi penuh 100% dengan warna merah menyala, dan persentase menampilkan nilai riil (misal: `115%`).
  - Badge menampilkan teks `Overbudget`.
- **AF-03: Belum Ada Transaksi Pengeluaran di Bulan Tersebut**:
  - `totalExpense = 0`, `remainingBudget = totalBudget`, `usagePercentage = 0%`. Progress bar berada pada titik awal (0%), badge berstatus "Aman".

---

# 7. Low-Fidelity UI Design
```text
+--------------------------------------------------------------------------+
|  ANGGARAN BULAN INI (Oktober 2026)                    [ Atur Anggaran ]  |
+--------------------------------------------------------------------------+
|                                                                          |
|  Total Anggaran          Total Pengeluaran         Sisa Anggaran         |
|  Rp 1.500.000            Rp 975.000                Rp 525.000            |
|                                                                          |
|  Status Penggunaan: [ Waspada (65%) ]                                    |
|  [==========================----------------------]  65%                 |
|                                                                          |
+--------------------------------------------------------------------------+
```

### Component Decomposition
```text
BudgetSection (Server Component)
├── BudgetHeader (Server Component) — judul periode bulan & tahun
│   └── EditBudgetButton (Client Component) — tombol modal ubah anggaran
├── BudgetMetricsGrid (Server Component) — 3 kartu nilai (Plafon, Terpakai, Sisa)
└── BudgetIndicatorBar (Server Component / Client Component) — progress bar dinamis + badge status
```

---

# 8. Visual Design & Tailwind Guidance
- **Container Card**: `rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-xs`
- **Label Metrik**: `text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1`
- **Nilai Angka**: `text-lg sm:text-xl font-mono font-bold tracking-tight tabular-nums`
- **Progress Track**: `w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden`
- **Progress Fill Dynamic Colors**:
  - Safe (< 70%): `bg-emerald-500 dark:bg-emerald-400`
  - Warning (70% - 99%): `bg-amber-500 dark:bg-amber-400`
  - Danger (>= 100%): `bg-rose-500 dark:bg-rose-400`
- **Status Badge**:
  - Safe: `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800`
  - Warning: `bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800`
  - Danger: `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800`

---

# 9. UI States
- **Default / Normal State**: Menampilkan 3 metrik keuangan, progress bar terisi proporsional, dan badge status aktif.
- **Empty State (No Budget Set)**: Card menampilkan pesan *"Belum ada anggaran yang ditentukan"* dengan CTA tombol "Atur Anggaran".
- **Overbudget State**: Angka sisa anggaran berwarna merah bertuliskan defisit, progress bar berwarna merah penuh, badge "Overbudget".
- **Zero Expense State**: Menampilkan pengeluaran Rp 0, sisa anggaran 100%, progress bar kosong (0%).
- **Loading State**: Komponen `BudgetSkeleton` menampilkan placeholder abu-abu beranimasi pulse saat kalkulasi data sedang diambil di server.

---

# 10. Error Container Specification
- Komponen ini berfokus pada penyajian data read-only. Jika terjadi kegagalan fetch database agregasi:
  - Tampilkan banner alert di dalam kontainer kartu anggaran:
  ```text
  [!] Gagal memuat ringkasan anggaran. Silakan muat ulang halaman.
  ```
  - Class Tailwind: `p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-mono text-rose-800 dark:text-rose-200`.

---

# 11. Form Specification
- Tidak ada form input langsung pada komponen summary dan indikator ini.
- Interaksi formulir didelegasikan ke `BudgetFormModal` yang diuraikan pada `prd-set-anggaran-bulanan-2.md`.

---

# 12. Frontend Validation
- Proteksi terhadap pembagian dengan nol (*divide by zero*):
```typescript
export function calculateBudgetPercentage(expense: number, budget: number): number {
  if (!budget || budget <= 0) return 0;
  return Math.round((expense / budget) * 100);
}
```
- Nilai lebar persentase style progress bar dibatasi maksimal 100% untuk mencegah overflow kontainer visual:
```typescript
const barWidth = Math.min(Math.max(percentage, 0), 100);
```

---

# 13. Backend Validation
Query database memastikan filter parameter bulan dan tahun merupakan integer yang sah sebelum melakukan agregasi:
```typescript
if (month < 1 || month > 12 || year < 2020 || year > 2099) {
  throw new Error('Parameter periode bulan atau tahun tidak valid.');
}
```

---

# 14. Input Sanitization & XSS Prevention
- Seluruh nilai nominal yang ditampilkan diformat melalui fungsi utility `formatRupiah(amount)` yang menghasilkan string angka terformat bersih.
- Tidak ada penggunaan `dangerouslySetInnerHTML`. Semua string dan atribut label terenkapsulasi aman dalam React JSX rendering tree.

---

# 15. SQL Injection Prevention
- Agregasi pengeluaran bulanan menggunakan Drizzle ORM query builder dengan metode parameterized SQL:
```typescript
const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
const lastDay = new Date(year, month, 0).getDate();
const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

const expenseSum = await db
  .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)::int` })
  .from(transactions)
  .where(
    and(
      eq(transactions.userId, currentUserId),
      eq(transactions.type, 'expense'),
      gte(transactions.transactionDate, startOfMonth),
      lte(transactions.transactionDate, endOfMonth)
    )
  );
```

---

# 16. Database Design
Fitur ini membaca data dari dua tabel yang telah ada:
1. `budgets` (`userId`, `month`, `year`, `amount`).
2. `transactions` (`userId`, `type`, `amount`, `transactionDate`).

Relasi konseptual:
- 1 User memiliki banyak Transaksi (`1:N`).
- 1 User memiliki banyak Anggaran Bulanan (`1:N`, unik per `month` + `year`).

---

# 17. Database Constraints
- Kolom `amount` pada kedua tabel bertipe integer tidak boleh bernilai negatif (`CHECK (amount >= 0)` atau validasi Zod).
- Foreign key `userId` wajib terhubung ke tabel `users(id)`.

---

# 18. Foreign Key Behavior
- Transaksi dan Anggaran terhubung ke pengguna via `ON DELETE CASCADE`.

---

# 19. Duplicate Handling
- Integritas data anggaran dijamin oleh indeks unik `user_month_year_budget_idx`, sehingga hasil query `select` untuk periode tertentu selalu menghasilkan maksimal 1 record tunggal.

---

# 20. HTTP Contract
### Get Monthly Budget Summary & Indicator
- **Method & URL**: `GET /api/budgets/summary?month=10&year=2026`
- **Headers**:
  ```text
  Authorization: Bearer <token> (atau via Cookie Session)
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "month": 10,
      "year": 2026,
      "budgetAmount": 1500000,
      "totalExpense": 975000,
      "remainingBudget": 525000,
      "usagePercentage": 65,
      "status": "warning",
      "hasBudget": true
    }
  }
  ```
- **Empty State Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "month": 10,
      "year": 2026,
      "budgetAmount": 0,
      "totalExpense": 350000,
      "remainingBudget": -350000,
      "usagePercentage": 0,
      "status": "unbudgeted",
      "hasBudget": false
    }
  }
  ```

---

# 21. Route Handler / Server Action Responsibilities
Fungsi `getMonthlyBudgetSummary(userId, month, year)`:
1. Validasi integer parameter `month` dan `year`.
2. Query tabel `budgets` untuk mendapatkan plafon anggaran user.
3. Query tabel `transactions` untuk menghitung total pengeluaran user dalam rentang tanggal 1 s/d hari terakhir bulan tersebut.
4. Hitung `remainingBudget`, `usagePercentage`, dan kategorisasi `status`.
5. Kembalikan struktur objek ringkasan bebas dari exception error mentah.

---

# 22. Drizzle Schema Responsibilities
- Menggunakan skema `transactions` dan `budgets` yang sudah terdefinisi.
- Menggunakan helper agregasi `sql` template literal dari Drizzle secara aman tanpa string injection.

---

# 23. Authorization
- **Owner Isolation**: Klausul `where(eq(..., currentUserId))` diterapkan mutlak pada query tabel `budgets` dan tabel `transactions`.
- Pengguna A tidak dapat melihat pengeluaran atau sisa anggaran milik Pengguna B dalam kondisi apa pun.

---

# 24. JWT Authentication
- Ekstraksi `currentUserId` dilakukan di level server melalui fungsi helper `getCurrentUserId()` berbasis cookie session terenkripsi.

---

# 25. Request Body Protection
- Tidak ada data body karena operasi bersifat pengambilan data (GET / Read-only Server Component). Parameter query URL divalidasi via Zod atau sanitasi numerik.

---

# 26. Error Handling
- Jika terjadi database timeout atau query error, kembalikan nilai fallback netral dengan flag `error: true` agar antarmuka tidak mengalami crash (SSR graceful degradation).

---

# 27. Transactions
- Operasi hanya membaca data (Read-only queries), tidak memerlukan database transaction.

---

# 28. Race Conditions
- Mengingat operasi bersifat agregasi pembacaan, race condition hanya berupa *eventual consistency* saat transaksi baru dicatat secara bersamaan. Revalidasi path Next.js memastikan data termutakhir langsung direfleksikan di UI.

---

# 29. Delete Behavior
- N/A (Fitur pembacaan ringkasan).

---

# 30. Empty State
- Jika pengguna belum mencatat anggaran untuk bulan tersebut:
  ```text
  +-------------------------------------------------------------+
  |  Target Anggaran Belum Ditetapkan                           |
  |  Tentukan batas pengeluaran untuk memantau keuangan Anda.   |
  |  [ + Atur Anggaran Bulan Ini ]                              |
  +-------------------------------------------------------------+
  ```

---

# 31. Pagination
- Pagination belum diperlukan pada MVP karena kalkulasi meringkas seluruh transaksi bulan berjalan menjadi 1 agregasi ringkas.

---

# 32. Search / Filter
- Penyaringan data otomatis mengikuti periode bulan dan tahun yang dikirimkan melalui props komponen atau URL search parameters.

---

# 33. Accessibility Minimum
- Progress bar menyertakan atribut ARIA semantis:
  `role="progressbar" aria-valuenow={usagePercentage} aria-valuemin={0} aria-valuemax={100} aria-label="Status penggunaan anggaran bulanan"`
- Indikator status tidak hanya mengandalkan warna, tetapi juga menampilkan teks eksplisit ("Aman", "Waspada", "Overbudget").

---

# 34. Responsive Behavior
- Desktop: Tiga kartu metrik berjajar horizontal dalam format grid 3 kolom (`grid grid-cols-1 sm:grid-cols-3`).
- Mobile: Kartu metrik ditumpuk vertikal dengan jarak rapat (`gap-3`), progress bar memiliki ketebalan memadai (`h-3.5`) untuk kemudahan keterbacaan di layar kecil.

---

# 35. Edge Cases
- **Pengeluaran Tepat 100%**: Sistem mengkategorikannya sebagai status `Overbudget` (atau `Warning`), progress bar penuh 100% merah.
- **Budget Rp 0 namun ada pengeluaran Rp 50.000**: Sistem menampilkan status `unbudgeted`, sisa anggaran `-Rp 50.000`, dan persentase tidak menampilkan `Infinity%`.
- **Tahun Kabisat (Februari 29 hari)**: Perhitungan rentang tanggal akhir bulan menggunakan `new Date(year, month, 0).getDate()` yang otomatis menghitung tanggal 28 atau 29 secara akurat.

---

# 36. Security Checklist
- [x] Query agregasi transaksi terisolasi secara ketat dengan `userId`.
- [x] Query anggaran terisolasi secara ketat dengan `userId`.
- [x] Tidak ada raw SQL tanpa parameter binding.
- [x] Proteksi pembagian dengan nol (*zero division guard*).
- [x] Atribut ARIA accessibility tersedia untuk screen reader.
- [x] Data diformat dengan aman tanpa eksekusi script.

---

# 37. Testing Strategy
- **Calculation Test**: Anggaran 1.000.000, Pengeluaran 400.000 -> Sisa 600.000, Persentase 40%, Status Aman (Hijau).
- **Warning Threshold Test**: Anggaran 1.000.000, Pengeluaran 850.000 -> Sisa 150.000, Persentase 85%, Status Waspada (Kuning).
- **Overbudget Test**: Anggaran 1.000.000, Pengeluaran 1.200.000 -> Sisa -200.000, Persentase 120%, Status Overbudget (Merah).
- **Zero Budget Test**: Anggaran belum ada, Pengeluaran 100.000 -> Empty state banner tampil, tidak terjadi error crash UI.
- **User Isolation Test**: Transaksi user B tidak mempengaruhi kalkulasi total pengeluaran user A.

---

# 38. Acceptance Criteria
- [ ] Kartu ringkasan menampilkan Plafon Anggaran, Total Pengeluaran Aktual, dan Sisa Anggaran dengan format Rupiah yang rapi.
- [ ] Progress bar dinamis menampilkan persentase penggunaan anggaran secara akurat.
- [ ] Warna progress bar dan badge status berubah dinamis sesuai ambang batas (Hijau < 70%, Kuning 70-99%, Merah >= 100%).
- [ ] Kondisi defisit (overbudget) ditandai dengan jelas menggunakan warna merah dan indikator minus.
- [ ] Pengguna yang belum menentukan anggaran melihat banner ajakan menentukan anggaran (empty state).
- [ ] Seluruh data dihitung murni dari transaksi dan anggaran milik pengguna yang sedang terotentikasi.

---

# 39. Definition of Done
- Fungsi agregasi Drizzle `getMonthlyBudgetSummary` berjalan optimal dan bebas SQL injection.
- Komponen `BudgetSummaryCard` dan `BudgetProgressBar` terintegrasi di halaman Dashboard.
- Aksesibilitas ARIA terverifikasi.
- Desain konsisten dengan tema Tailwind zinc minimalis (mendukung dark/light mode).

---

# 40. Implementation Order Inside Feature
1. Buat helper kalkulasi tanggal dan agregasi Drizzle di `src/actions/budget.ts` atau `src/lib/budget.ts`.
2. Implementasikan fungsi `getMonthlyBudgetSummary(userId, month, year)`.
3. Buat Server Component `BudgetSummaryCard` untuk menampilkan 3 metrik angka.
4. Buat komponen `BudgetProgressBar` dengan logika penentuan warna dan badge status.
5. Susun empty state banner jika data anggaran bernilai null.
6. Integrasikan komponen ke dalam `src/app/dashboard/page.tsx`.
7. Uji kalkulasi dengan berbagai variasi nominal transaksi.

---

# 41. Estimated 60-Minute Breakdown
```text
0–15 menit: Query Drizzle agregasi transaksi + kalkulasi metrik & sisa anggaran
15–30 menit: Komponen BudgetSummaryCard (3 kartu nilai Rupiah + responsive grid)
30–45 menit: Komponen BudgetProgressBar + dynamic color logic + status badge
45–55 menit: Integrasi Empty State dan penanganan kondisi Overbudget
55–60 menit: Pengujian visual responsif, dark mode, dan edge case division by zero
```

---

# 42. Explicit Non-Requirements
- Tidak diperlukan integrasi grafik chart pie/donut pihak ketiga.
- Tidak diperlukan sistem peringatan SMS/WhatsApp otomatis.
- Tidak diperlukan analisis riwayat perbandingan grafik tahunan.
