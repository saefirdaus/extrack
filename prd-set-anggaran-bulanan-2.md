# FILE: prd-set-anggaran-bulanan-2.md

# 1. Feature Overview
- **Nama Fitur**: Penetapan & Pembaruan Anggaran Bulanan (Set Monthly Budget).
- **Tujuan Fitur**: Memfasilitasi pengguna untuk menetapkan target/plafon batas pengeluaran bulanan untuk periode bulan dan tahun tertentu, serta memperbaruinya jika terjadi perubahan rencana keuangan.
- **Masalah yang Diselesaikan**: Pengguna sering kesulitan membatasi pengeluaran bulanan karena tidak memiliki batas acuan (*budget ceiling*) yang tercatat secara formal di dalam sistem.
- **Pengguna/Aktor**: Mahasiswa / Pengguna terotentikasi.
- **Dependency**: Urutan 2 (Bergantung pada `prd-autentikasi-session-1.md` untuk identitas user `userId`, serta berjalan paralel dengan `prd-budget-summary-indikator-2.md`).
- **Alasan Urutan Implementasi**: Tabel `budgets` dan kapabilitas penyimpanan nominal anggaran harus tersedia terlebih dahulu sebelum sistem dapat menampilkan kalkulasi sisa anggaran dan visual progress bar.

---

# 2. User Story
- **US-B01 (Set Budget Baru)**: Sebagai pengguna, saya ingin menetapkan batas nominal anggaran pengeluaran untuk bulan dan tahun tertentu, sehingga saya memiliki target batas maksimal belanja dalam sebulan.
- **US-B02 (Edit Budget Ada)**: Sebagai pengguna, saya ingin memperbarui nominal anggaran bulan tertentu jika rencana keuangan saya berubah, sehingga batas anggaran tetap realistis.
- **US-B03 (Owner Isolation)**: Sebagai pengguna, saya ingin memastikan anggaran yang saya buat hanya dapat dilihat dan diubah oleh saya sendiri.

---

# 3. Scope
## MVP / Required (Harus selesai dalam 60 menit)
- Skema Drizzle untuk tabel `budgets` (`id`, `user_id`, `month`, `year`, `amount`, `created_at`, `updated_at`) dengan UNIQUE constraint pada kombinasi `(user_id, month, year)`.
- Validasi Zod schema `setBudgetSchema` (shared untuk client dan server).
- Route Handler `POST /api/budgets` (atau Server Action `setBudgetAction`) untuk menangani Create & Update (Upsert pattern).
- Modal Form Penetapan Anggaran (`BudgetFormModal`):
  - Input nominal anggaran (hanya angka positif, format Rupiah).
  - Selector bulan & tahun target.
- Proteksi otorisasi: `userId` diekstrak dari JWT session cookie, bukan dari payload request body pengguna.
- Pencegahan double submit dan penanganan error container per field.

## If Time Permits
- Quick set buttons (tombol nominal instan: Rp500.000, Rp1.000.000, Rp1.500.000, Rp2.000.000).
- Salin anggaran dari bulan sebelumnya (*Copy from previous month*).

## Out of Scope
- Alokasi anggaran per sub-kategori pengeluaran (misal: anggaran makan terpisah dengan anggaran bensin).
- Multi-currency selain IDR.
- Sistem notifikasi peringatan email atau push notification saat anggaran overbudget.

---

# 4. Preconditions
- User telah login dengan cookie session JWT yang valid (`AUTH_COOKIE_NAME`).
- Database PostgreSQL terhubung dan tabel `users` sudah tersedia.
- Skema Drizzle telah di-push via `npx drizzle-kit push`.

---

# 5. Main User Flow
1. Pengguna membuka halaman dashboard keuangan atau tab anggaran (`/dashboard`).
2. Pengguna mengklik tombol **"Tetapkan Anggaran"** (atau **"Ubah Anggaran"** jika sudah ada untuk bulan aktif).
3. Client Component `BudgetModal` terbuka menampilkan form pengisian:
   - Bulan dan tahun terpilih (default: bulan dan tahun aktif, misal: Oktober 2026).
   - Input nominal target anggaran (contoh: `1500000`).
4. Pengguna mengetikkan nominal anggaran, format tampilan Rupiah terformat otomatis (`Rp 1.500.000`).
5. Pengguna menekan tombol **"Simpan Anggaran"**.
6. Frontend Client Component memvalidasi input menggunakan `setBudgetSchema` (Zod).
7. Jika valid, frontend menonaktifkan tombol submit (`isSubmitting = true`) dan mengirim request `POST /api/budgets` dengan header `Authorization` atau memanggil Server Action `setBudgetAction`.
8. Backend mengekstrak `userId` dari JWT token valid, memvalidasi body dengan Zod schema yang sama.
9. Backend memeriksa apakah sudah ada data anggaran untuk `(userId, month, year)` tersebut:
   - Jika belum ada: lakukan `INSERT INTO budgets`.
   - Jika sudah ada: lakukan `UPDATE budgets SET amount = newAmount, updated_at = NOW()`.
10. Backend mengembalikan response `200 OK` (atau `201 Created`) beserta objek anggaran.
11. Frontend menerima response sukses, menutup modal, menampilkan toast notifikasi "Anggaran berhasil disimpan", dan memperbarui tampilan ringkasan anggaran.

---

# 6. Alternative Flow
- **AF-01: Input Nominal Kosong atau <= 0**:
  - Validasi frontend Zod menolak submit, menampilkan pesan "Nominal anggaran harus lebih dari Rp 0" tepat di bawah input nominal. Request tidak dikirim ke server.
- **AF-02: User Belum Terotentikasi (Token Kadaluarsa)**:
  - Backend menolak dengan status `401 Unauthorized`. Frontend menghapus sesi dan me-redirect pengguna ke `/login`.
- **AF-03: Upaya Manipulasi `userId`**:
  - Malicious client mengirim body JSON berisi `userId: 999`. Backend mengabaikan field tersebut dan secara ketat menggunakan `userId` hasil verifikasi token JWT.
- **AF-04: Database Error / Gangguan Jaringan**:
  - Server mengembalikan `500 Internal Server Error` dengan pesan aman "Gagal menyimpan anggaran. Silakan coba kembali." Modal tetap terbuka dan field error container di bagian atas menampilkan pesan tersebut.

---

# 7. Low-Fidelity UI Design
```text
+-------------------------------------------------------------+
| Atur Anggaran Bulanan                                   [X] |
+-------------------------------------------------------------+
| Periode Anggaran                                            |
| [ Oktober 2026                                           v ]|
|                                                             |
| Target Batas Pengeluaran (Rp)                               |
| [ Rp 1.500.000                                            ] |
| [ validation error: Nominal harus lebih dari Rp 0        ] |
|                                                             |
| Pilihan Cepat:                                              |
| [ Rp 500rb ]  [ Rp 1jt ]  [ Rp 1.5jt ]  [ Rp 2jt ]          |
|                                                             |
| [ Batal ]                             [ Simpan Anggaran ]   |
+-------------------------------------------------------------+
```

### Component Decomposition
```text
DashboardBudgetSection (Server Component)
├── BudgetOverviewHeader (Server Component) — menampilkan info periode aktif
└── SetBudgetTrigger (Client Component) — tombol pemicu modal
    └── BudgetModal (Client Component) — state isOpen, animasi overlay modal
        └── BudgetForm (Client Component) — controlled inputs, Rupiah formatter, Zod validation, submit action
```

---

# 8. Visual Design & Tailwind Guidance
- **Modal Backdrop**: `fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4`
- **Modal Container**: `bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl`
- **Primary Button**: `bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold px-4 py-2 rounded-lg text-xs hover:opacity-90 disabled:opacity-50 transition-opacity`
- **Secondary Button**: `border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50`
- **Input Field**: `w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-mono focus:border-zinc-400 focus:outline-none dark:focus:border-zinc-700`
- **Error Container**: `text-[11px] font-mono text-rose-600 dark:text-rose-400 mt-1.5`

---

# 9. UI States
- **Default State**: Modal tertutup. Tombol "Atur Anggaran" tersedia.
- **Form Active State**: Modal terbuka dengan nilai nominal kosong atau nominal lama terisi otomatis.
- **Submitting State**: Tombol "Simpan Anggaran" berubah teks menjadi "Menyimpan...", disabled, cursor wait.
- **Success State**: Toast notification hijau muncul di pojok kanan atas, modal otomatis tertutup.
- **Validation Error State**: Garis batas input berwarna merah (`border-rose-500`), pesan error muncul di bawah input.
- **Server Error State**: Banner merah tampil di bagian atas formulir dengan pesan kesalahan ramah pengguna.
- **Unauthorized State**: Redirect otomatis ke `/login`.

---

# 10. Error Container Specification
- **Field-level Error (Amount)**:
  - Lokasi: Tepat di bawah input `amount`.
  - Class: `text-[11px] font-mono text-rose-600 dark:text-rose-400 mt-1`.
  - Kondisi: Dirender hanya jika `errors.amount` memiliki isi.
- **Form-level General Error**:
  - Lokasi: Di atas field periode anggaran.
  - Class: `p-2.5 mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-mono text-rose-800 dark:text-rose-200`.
- **Toast Notification**:
  - Lokasi: Pojok kanan atas (`fixed top-4 right-4 z-50`).
  - Durasi auto-dismiss: 3 detik.

---

# 11. Form Specification
### 1. Month (`month`)
- HTML: `<input type="hidden">` atau `<select>`
- Tipe Data: `integer` (1 - 12)
- Required: Ya
- Default: Bulan saat ini (misal: 10 untuk Oktober)

### 2. Year (`year`)
- HTML: `<input type="hidden">` atau `<select>`
- Tipe Data: `integer` (2020 - 2099)
- Required: Ya
- Default: Tahun saat ini (misal: 2026)

### 3. Amount (`amount`)
- HTML: `<input type="text" inputMode="numeric">`
- Name: `amount`
- Required: Ya
- Placeholder: `e.g. 1.500.000`
- React Controlled State: `const [displayAmount, setDisplayAmount] = useState('')` & `const [rawAmount, setRawAmount] = useState<number>(0)`
- Atribut: `autoComplete="off"`

---

# 12. Frontend Validation
```typescript
// lib/validations/budget.ts
import { z } from 'zod';

export const setBudgetSchema = z.object({
  month: z.number().int().min(1, 'Bulan tidak valid.').max(12, 'Bulan tidak valid.'),
  year: z.number().int().min(2020, 'Tahun tidak valid.').max(2099, 'Tahun tidak valid.'),
  amount: z.coerce
    .number({ invalid_type_error: 'Nominal harus berupa angka.' })
    .int('Nominal harus bilangan bulat.')
    .positive('Nominal anggaran harus lebih dari Rp 0.')
    .max(1000000000, 'Nominal anggaran maksimal Rp 1.000.000.000.'),
});

export type SetBudgetInput = z.infer<typeof setBudgetSchema>;
```

---

# 13. Backend Validation
Route Handler memverifikasi validitas payload secara independen:
```typescript
const result = setBudgetSchema.safeParse(body);
if (!result.success) {
  return Response.json(
    {
      success: false,
      message: 'Validasi gagal.',
      errors: result.error.flatten().fieldErrors,
    },
    { status: 400 }
  );
}
```

---

# 14. Input Sanitization & XSS Prevention
- Field `amount`, `month`, dan `year` divalidasi ketat sebagai tipe numerik integer via Zod coercion.
- Tidak ada input teks bebas atau markup HTML yang dirender mentah ke browser.
- React JSX meng-escape seluruh nilai numerik saat menampilkan kembali data ke pengguna.

---

# 15. SQL Injection Prevention
- Seluruh interaksi database dilakukan melalui Drizzle ORM query builder.
- Tidak ada perakitan raw query SQL dengan konkatenasi string.
- Drizzle secara otomatis menggunakan parameterized query untuk seluruh nilai input.

---

# 16. Database Design
```typescript
// src/db/schema/budgets.ts
import { pgTable, serial, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

export const budgets = pgTable(
  'budgets',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    month: integer('month').notNull(), // 1 - 12
    year: integer('year').notNull(),   // e.g. 2026
    amount: integer('amount').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_month_year_budget_idx').on(table.userId, table.month, table.year),
  ]
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
```

---

# 17. Database Constraints
- **Primary Key**: `id` auto-increment serial.
- **Foreign Key**: `user_id` merujuk ke `users(id)` dengan `ON DELETE CASCADE`.
- **Not Null Constraints**: Seluruh kolom (`user_id`, `month`, `year`, `amount`) bertanda `.notNull()`.
- **Unique Constraint**: Kombinasi `(user_id, month, year)` wajib unik sehingga seorang pengguna hanya memiliki tepat 1 entri anggaran per bulan.

---

# 18. Foreign Key Behavior
- `userId -> users.id`
- Strategy: `CASCADE`
- Alasan: Jika data akun pengguna dihapus dari sistem, seluruh catatan target anggaran milik pengguna tersebut harus terhapus secara otomatis demi integritas data dan pembersihan penyimpanan.

---

# 19. Duplicate Handling
- **Definisi Duplikat**: Pengguna menetapkan anggaran pada bulan dan tahun yang sudah pernah dicatat sebelumnya.
- **Penanganan**: Sistem mengimplementasikan pola **Upsert**. Jika record untuk `(user_id, month, year)` sudah ada di database, sistem melakukan pembaruan (`UPDATE amount = newAmount, updatedAt = NOW()`) alih-alih melempar error konflik.

```typescript
await db
  .insert(budgets)
  .values({
    userId,
    month: data.month,
    year: data.year,
    amount: data.amount,
  })
  .onConflictDoUpdate({
    target: [budgets.userId, budgets.month, budgets.year],
    set: {
      amount: data.amount,
      updatedAt: new Date(),
    },
  });
```

---

# 20. HTTP Contract
### Set or Update Budget
- **Method & URL**: `POST /api/budgets`
- **Headers**:
  ```text
  Content-Type: application/json
  Authorization: Bearer <token> (atau via Cookie Session)
  ```
- **Request Body**:
  ```json
  {
    "month": 10,
    "year": 2026,
    "amount": 1500000
  }
  ```
- **Success Response (200 OK / 201 Created)**:
  ```json
  {
    "success": true,
    "message": "Anggaran bulanan berhasil disimpan.",
    "data": {
      "id": 1,
      "userId": 4,
      "month": 10,
      "year": 2026,
      "amount": 1500000,
      "updatedAt": "2026-10-01T08:00:00Z"
    }
  }
  ```
- **Validation Error (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Validasi gagal.",
    "errors": {
      "amount": ["Nominal anggaran harus lebih dari Rp 0."]
    }
  }
  ```
- **Unauthorized (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Sesi tidak valid atau telah berakhir."
  }
  ```

---

# 21. Route Handler Responsibilities
`app/api/budgets/route.ts` (atau Server Action `setBudgetAction`):
1. Verifikasi sesi pengguna melalui token JWT di cookie/header. Jika tidak ada/invalid, kembalikan `401`.
2. Ekstrak `userId` terverifikasi.
3. Parse request body dan validasi menggunakan `setBudgetSchema`. Jika gagal, kembalikan `400` beserta map error.
4. Jalankan query Upsert Drizzle pada tabel `budgets`.
5. Revalidasi cache halaman dashboard (`revalidatePath('/dashboard')`).
6. Kembalikan response JSON `200` dengan payload data tersimpan.
7. Tangani kegagalan database dalam blok `try...catch` dan kembalikan `500` tanpa membocorkan stack trace.

---

# 22. Drizzle Schema Responsibilities
- Mendefinisikan tabel `budgets` dengan tipe data presisi (`integer` untuk amount, month, year).
- Menyediakan indeks unik `user_month_year_budget_idx` untuk mendukung optimasi query dan integritas constraint upsert.
- Hanya mengizinkan penulisan field yang telah divalidasi oleh Zod schema.

---

# 23. Authorization
- **Owner Isolation**: Pengguna hanya diizinkan memanipulasi anggaran milik `userId` dirinya sendiri.
- Nilai `userId` tidak boleh diambil dari request body klien, melainkan mutlak diambil dari token session JWT hasil dekripsi di server.

---

# 24. JWT Authentication
- Menggunakan library `jose` dengan algoritma signing `HS256`.
- Secret key diambil dari environment variable `JWT_SECRET`.
- Token dikirimkan otomatis melalui httpOnly cookie (`AUTH_COOKIE_NAME`).

---

# 25. Request Body Protection
- Zod schema `setBudgetSchema` secara eksplisit hanya mem-parsing `month`, `year`, dan `amount`.
- Setiap parameter lain yang disisipkan oleh klien (seperti `userId`, `role`, `id`) otomatis diabaikan (*stripped*) oleh parser.

---

# 26. Error Handling
- **400 Bad Request**: Input invalid (nominal negatif, bulan di luar rentang 1-12). Ditampilkan langsung di bawah field input formulir.
- **401 Unauthorized**: Token habis masa berlaku. Frontend merespons dengan me-redirect browser ke halaman login.
- **500 Internal Server Error**: Kegagalan database. Menampilkan pesan safe error di banner formulir.

---

# 27. Transactions
- Operasi upsert anggaran adalah single-statement query Drizzle (`insert ... onConflictDoUpdate`), sehingga tidak membutuhkan multi-statement transaction manual.

---

# 28. Race Conditions
- Jika terdapat dua request simultan yang mencoba menyimpan anggaran untuk bulan yang sama, `UNIQUE INDEX (user_id, month, year)` menjamin tidak akan terjadi duplikasi baris. Statement upsert atomik di PostgreSQL menyelesaikan race condition dengan aman.

---

# 29. Delete Behavior
- Untuk MVP praktikum 60 menit, fitur delete anggaran tidak dibutuhkan. Jika pengguna ingin menonaktifkan anggaran, mereka cukup mengubah nominalnya menjadi nilai baru atau sistem menafsirkannya sebagai budget 0.

---

# 30. Empty State
- Jika pengguna belum pernah menetapkan anggaran pada bulan aktif, kartu anggaran menampilkan banner:
  *"Belum ada anggaran yang ditetapkan untuk bulan ini."* disertai tombol CTA **[+ Tetapkan Anggaran]**.

---

# 31. Pagination
- Pagination belum diperlukan pada MVP karena anggaran diakses secara spesifik per 1 bulan aktif.

---

# 32. Search / Filter
- Pemilihan periode anggaran dilakukan melalui parameter `month` dan `year` (dijelaskan detail pada `prd-monthly-budget-selector-3.md`).

---

# 33. Accessibility Minimum
- Input memiliki elemen `<label htmlFor="budget-amount">` yang terhubung secara semantis.
- Error container memiliki atribut `role="alert"`.
- Tombol modal dan aksi memiliki focus ring Tailwind (`focus:ring-2 focus:ring-zinc-900`).
- Modal dapat ditutup menggunakan tombol keyboard `Esc`.

---

# 34. Responsive Behavior
- Desktop: Modal berukuran `max-w-md` di tengah layar dengan margin simetris.
- Mobile: Modal menyesuaikan lebar layar dengan padding `p-4` dan tombol aksi full width.

---

# 35. Edge Cases
- Pengguna memasukkan nominal dengan tanda titik atau koma (misal `1.500.000`): Frontend melakukan sanitasi regex `replace(/\D/g, '')` sebelum parsing angka murni.
- Pengguna menekan tombol Simpan berkali-kali secara cepat: Double submit dicegah melalui state `isSubmitting = true`.
- Nilai nominal melebihi batas integer: Dibatasi maksimal Rp 1.000.000.000 pada schema Zod.

---

# 36. Security Checklist
- [x] Frontend validation tersedia (Zod).
- [x] Backend validation tersedia (Zod).
- [x] Output user-generated content di-escape oleh React.
- [x] Tidak ada raw SQL concatenation (Drizzle query builder).
- [x] Database constraint UNIQUE index `(user_id, month, year)` aktif.
- [x] JWT diverifikasi di Route Handler / Server Action.
- [x] `userId` diambil dari token JWT, bukan dari client request body.
- [x] `JWT_SECRET` tidak menggunakan prefix `NEXT_PUBLIC_`.
- [x] Internal database error tidak diekspos ke client.

---

# 37. Testing Strategy
- **Happy Path**: Masukkan nominal Rp 1.000.000 untuk bulan aktif -> Data berhasil disimpan -> Response 200 -> Modal tertutup -> Tampilan ter-refresh.
- **Validation Test**: Masukkan nominal 0 atau minus -> Menampilkan pesan error di bawah input -> Tidak ada request dikirim.
- **Upsert Test**: Ubah nominal anggaran yang sudah ada menjadi Rp 2.000.000 -> Data ter-update tanpa membuat baris baru di database.
- **Auth Test**: Kirim request tanpa token -> Menerima 401 Unauthorized.
- **Security Test**: Sisipkan `userId: 1` pada body saat login sebagai user 2 -> Anggaran tetap tersimpan untuk user 2.

---

# 38. Acceptance Criteria
- [ ] Pengguna dapat membuka modal penetapan anggaran dari dashboard.
- [ ] Pengguna dapat menyimpan target nominal anggaran bulanan valid.
- [ ] Input nominal 0 atau negatif ditolak dengan pesan kesalahan yang jelas.
- [ ] Jika anggaran untuk bulan tersebut sudah ada, nominal berhasil diperbarui (Upsert).
- [ ] Pengguna lain tidak dapat melihat atau mengubah anggaran milik pengguna yang sedang aktif.
- [ ] Tombol Simpan disabled dan menampilkan teks loading saat proses pengiriman berlangsung.

---

# 39. Definition of Done
- Skema Drizzle `budgets` terpasang di database.
- Validasi Zod `setBudgetSchema` berfungsi di sisi client dan server.
- Handler / Action penyimpanan anggaran sukses diuji end-to-end.
- Modal UI responsif di perangkat mobile dan desktop.
- Tidak ada error warning TypeScript atau console log yang tertinggal.

---

# 40. Implementation Order Inside Feature
1. Buat skema Drizzle `budgets` di `src/db/schema/budgets.ts`.
2. Push skema ke database dengan `npx drizzle-kit push`.
3. Definisikan Zod validation schema di `src/lib/validation/budget.ts`.
4. Buat Server Action / API Handler di `src/actions/budget.ts` dengan proteksi JWT session.
5. Buat Client Component `BudgetModal` dan `BudgetForm`.
6. Pasang trigger tombol "Tetapkan Anggaran" di dashboard.
7. Uji validasi input, flow upsert, dan feedback toast.

---

# 41. Estimated 60-Minute Breakdown
```text
0–15 menit: Skema Drizzle budgets + Migration Push + Zod Schema
15–30 menit: Server Action / Route Handler Upsert + JWT Auth Verification
30–45 menit: Komponen Form Modal + Controlled Input Rupiah Formatter
45–55 menit: Integrasi State Submitting + Error Handling + Revalidasi Dashboard
55–60 menit: Pengujian Kasus Positif, Negatif, dan Edge Cases
```

---

# 42. Explicit Non-Requirements
- Tidak diperlukan sistem budgeting per kategori pos pengeluaran.
- Tidak diperlukan recurring copy budget otomatis per pergantian tahun.
- Tidak diperlukan library form pihak ketiga (cukup React state standar).
- Tidak menggunakan WebSocket atau real-time polling.
