# FILE: prd-manajemen-transaksi-1.md

# 1. Feature Overview
- **Nama Fitur**: Manajemen Transaksi Keuangan (CRUD & Authorization).
- **Tujuan Fitur**: Memungkinkan mahasiswa mencatat pemasukan dan pengeluaran baru, melihat riwayat transaksi lengkap, mengedit transaksi yang salah dicatat, dan menghapus transaksi dengan batasan otorisasi kepemilikan data yang ketat.
- **Masalah yang Diselesaikan**: Memberikan kontrol penuh kepada mahasiswa untuk mengelola catatan arus kas pribadi secara akurat dan menjaga kerahasiaan data dari pengguna lain.
- **Pengguna/Aktor**: Mahasiswa terotentikasi.
- **Dependency**: Urutan 1 (Dapat dikerjakan bersamaan secara independen dengan PRD Auth dan PRD Dashboard melalui helper mock auth terisolasi selama fase development 60 menit).
- **Alasan Urutan Implementasi**: Merupakan entitas bisnis utama (*core domain*) dari aplikasi Expense Tracker.

---

# 2. User Story
- **US-05 (Create Transaction)**: Sebagai mahasiswa, saya ingin mencatat transaksi baru dengan memilih jenis (Pemasukan/Pengeluaran), memasukkan nominal uang, kategori/deskripsi, dan tanggal, sehingga data keuangan saya tercatat rapi.
- **US-06 (Read Transactions)**: Sebagai mahasiswa, saya ingin melihat daftar seluruh riwayat transaksi saya dalam tabel yang rapi, sehingga saya mengetahui ke mana saja uang saya keluar/masuk.
- **US-07 (Update Transaction)**: Sebagai mahasiswa, saya ingin mengubah detail transaksi yang sudah pernah saya simpan jika ada kekeliruan nominal atau deskripsi.
- **US-08 (Delete Transaction)**: Sebagai mahasiswa, saya ingin menghapus transaksi yang tidak sengaja terduplikasi atau batal dilakukan.
- **US-09 (Authorization Boundary)**: Sebagai pengguna, saya ingin memastikan pengguna lain tidak bisa melihat, mengedit, ataupun menghapus transaksi milik saya.

---

# 3. Scope
## MVP / Required (Harus selesai dalam 60 menit)
- Skema Drizzle untuk tabel `transactions` (`id`, `user_id`, `type`, `amount`, `description`, `transaction_date`, `created_at`).
- Halaman Daftar Transaksi (`/dashboard/transactions`): Menampilkan tabel riwayat transaksi milik user login dengan tombol Tambah, Edit, dan Hapus.
- Halaman Tambah Transaksi (`/dashboard/transactions/new`): Form input tipe (Pemasukan/Pengeluaran), nominal (angka > 0), deskripsi (teks), dan tanggal transaksi.
- Halaman Edit Transaksi (`/dashboard/transactions/[id]/edit`): Form yang terisi data lama dengan proteksi otorisasi kepemilikan.
- Server Action Hapus Transaksi (`deleteTransactionAction`): Penghapusan record dengan konfirmasi browser native dan pengecekan `user_id`.
- Otorisasi Ketat: Semua operasi query Drizzle (`select`, `update`, `delete`) WAJIB memiliki klausul `where(and(eq(transactions.id, id), eq(transactions.userId, currentUserId)))`.

## If Time Permits
- Badge warna visual pada tabel: Hijau untuk Pemasukan (`+ Rp...`), Merah untuk Pengeluaran (`- Rp...`).
- Format mata uang Rupiah otomatis saat menampilkan tabel (`Intl.NumberFormat('id-ID')`).

## Out of Scope
- Upload bukti transfer / foto struk transaksi.
- Transaksi berulang otomatis (recurring transaction mingguan/bulanan).
- Multi-currency / mata uang asing selain IDR.

---

# 4. Preconditions
- Tabel database PostgreSQL siap menerima skema Drizzle via `npx drizzle-kit push`.
- Identitas user (`userId`) tersedia dari JWT helper atau fallback mock ID (`userId = 1`) selama pengujian lokal di 60 menit praktikum.

---

# 5. Main User Flow
### Menambah Transaksi
1. User berada di `/dashboard/transactions` lalu menekan tombol **+ Catat Transaksi**.
2. Sistem menampilkan halaman form `/dashboard/transactions/new`.
3. User memilih jenis (`income` atau `expense`), mengisi nominal (misal: `50000`), mengisi deskripsi (misal: `Uang Saku Bulanan`), dan memilih tanggal.
4. User menekan tombol **Simpan Transaksi**.
5. Server Action `createTransactionAction` memvalidasi input dan menyimpan data ke database dengan `userId` milik user yang sedang aktif.
6. Sistem me-redirect user kembali ke `/dashboard/transactions` dan menampilkan flash alert sukses.

### Mengubah Transaksi
1. Pada baris tabel transaksi, user menekan tombol **Edit**.
2. Sistem membuka `/dashboard/transactions/[id]/edit` setelah memverifikasi bahwa transaksi tersebut milik user yang login.
3. Form terisi otomatis dengan data transaksi saat ini.
4. User mengubah nominal atau deskripsi, lalu menekan **Simpan Perubahan**.
5. Server Action `updateTransactionAction` memvalidasi dan memperbarui data di database.
6. User diarahkan kembali ke daftar transaksi dengan flash pesan sukses.

### Menghapus Transaksi
1. Pada baris tabel transaksi, user menekan tombol **Hapus**.
2. Browser memunculkan dialog konfirmasi native: *"Apakah Anda yakin ingin menghapus transaksi ini?"*.
3. Jika user menekan OK, form submit memicu `deleteTransactionAction`.
4. Backend memverifikasi kepemilikan dan menghapus transaksi dari tabel.
5. Halaman me-refresh daftar transaksi dan menampilkan alert sukses.

---

# 6. Alternative Flow
- **Nominal Negatif atau Nol**: Form submit nominal `<= 0` -> Server Action menolak dengan pesan "Nominal harus lebih besar dari 0".
- **Akses Transaksi Orang Lain (URL ID Tampering)**: User A mencoba membuka `/dashboard/transactions/99/edit` di mana ID 99 adalah milik User B -> Backend mendeteksi ketidaksesuaian `userId` -> langsung melempar respons `notFound()` atau redirect ke `/dashboard/transactions` dengan pesan error "Transaksi tidak ditemukan".
- **Hapus Data yang Sudah Hilang**: User mencoba menghapus transaksi yang telah dihapus di tab lain -> sistem menangani tanpa crash dan memberikan informasi aman.

---

# 7. Low-Fidelity UI Design

### Daftar Transaksi (`/dashboard/transactions`)
```text
+------------------------------------------------------------------------+
| Transaksi Keuangan                           [+ Catat Transaksi Baru]  |
+------------------------------------------------------------------------+
| [ Alert Flash: Transaksi berhasil disimpan!                          ] |
|                                                                        |
| Tanggal    | Keterangan          | Jenis       | Nominal     | Aksi     |
|------------|---------------------|-------------|-------------|----------|
| 25/09/2026 | Uang Bulanan Ortu   | [Pemasukan] | Rp1.500.000 | Edit Hapus|
| 25/09/2026 | Makan Siang Warteg  | [Pengeluaran| Rp25.000    | Edit Hapus|
+------------------------------------------------------------------------+
```

### Form Transaksi (`/dashboard/transactions/new` & `edit`)
```text
+--------------------------------------------------------+
| Catat Transaksi Baru                                   |
+--------------------------------------------------------+
| Jenis Transaksi                                        |
| (*) Pemasukan   ( ) Pengeluaran                        |
| [ Error: Jenis transaksi wajib dipilih               ] |
|                                                        |
| Nominal (Rp)                                           |
| [ 50000                                              ] |
| [ Error: Nominal harus lebih besar dari 0            ] |
|                                                        |
| Keterangan / Deskripsi                                 |
| [ Pembayaran Modul Praktikum                         ] |
| [ Error: Deskripsi wajib diisi                       ] |
|                                                        |
| Tanggal Transaksi                                      |
| [ 2026-09-25                                         ] |
| [ Error: Tanggal tidak valid                         ] |
|                                                        |
| [ Batal ]                       [ Simpan Transaksi ]   |
+--------------------------------------------------------+
```

---

# 8. Visual Design & Tailwind Guidance
- **Container**: `max-w-5xl mx-auto px-4 py-8`
- **Card**: `bg-white rounded-xl shadow-sm border border-gray-100 p-6`
- **Table**: `w-full text-left text-sm text-gray-600 border-collapse`
- **Table Header**: `bg-gray-50 text-gray-700 font-semibold px-4 py-3 border-b`
- **Table Row**: `border-b border-gray-100 hover:bg-gray-50/50 transition`
- **Badge Pemasukan**: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`
- **Badge Pengeluaran**: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800`
- **Tombol Tambah**: `bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition`
- **Tombol Hapus**: `text-red-600 hover:text-red-800 font-medium text-xs ml-3`
- **Tombol Edit**: `text-blue-600 hover:text-blue-800 font-medium text-xs`

---

# 9. UI States
- **Empty State**: Jika belum ada transaksi, tabel digantikan dengan:
  ```text
  Belum ada catatan transaksi.
  Mulai kelola keuangan Anda dengan mencatat transaksi pertama.
  [+ Catat Transaksi Sekarang]
  ```
- **Populated State**: Tabel menampilkan daftar riwayat transaksi terurut dari tanggal terbaru.
- **Submitting State**: Tombol submit menampilkan teks disabled *"Menyimpan..."*.
- **Validation Error State**: Input border berwarna merah dan pesan error muncul tepat di bawah field.
- **AJAX Loading Spinner**: **Tidak diperlukan**, karena menggunakan Server-Rendered page dan Server Action native.

---

# 10. Error Container Specification
- **Field Error**: Terletak tepat di bawah setiap input (`type`, `amount`, `description`, `transactionDate`), menggunakan styling `<p className="mt-1 text-xs text-red-600 font-medium">`.
- **Form Global Error**: Banner `<div className="p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">` di atas judul form.
- **Delete Confirmation**: Menggunakan browser native `window.confirm('Yakin ingin menghapus transaksi ini?')` pada button delete untuk kesederhanaan sesi 60 menit.

---

# 11. Form Specification
1. **Type (Jenis Transaksi)**:
   - Radio button / Select dropdown: `name="type"`, value: `'income'` atau `'expense'`.
   - Default: `'expense'`.
2. **Amount (Nominal)**:
   - `name="amount"`, `type="number"`, `min="1"`, `step="1"`, required, placeholder: `Contoh: 50000`.
3. **Description**:
   - `name="description"`, `type="text"`, required, `maxlength="255"`, placeholder: `Contoh: Beli Makan Siang`.
4. **Transaction Date**:
   - `name="transactionDate"`, `type="date"`, required, default value: tanggal hari ini (`YYYY-MM-DD`).

---

# 12. Frontend Validation
- `required` pada field nominal, deskripsi, tanggal, dan tipe.
- `min="1"` pada input nominal (mencegah angka 0 atau negatif di level browser).
- `maxlength="255"` pada deskripsi.

---

# 13. Backend Validation
Divalidasi secara ketat di Server Action (`src/actions/transactions.ts`):
- `type`: wajib diisi, nilai harus salah satu dari `['income', 'expense']`.
- `amount`: wajib angka bulat positif integer (`parseInt(val) > 0`).
- `description`: wajib string, `trim()`, minimal 3 karakter, maksimal 255 karakter.
- `transactionDate`: wajib format tanggal valid (ISO format / `YYYY-MM-DD`).

---

# 14. Input Sanitization & XSS Prevention
- Field `description` di-`trim()`.
- Data deskripsi dirender menggunakan escaping JSX (`{item.description}`).
- Karakter HTML seperti `<script>` akan dirender sebagai teks biasa dan tidak dapat dieksekusi.

---

# 15. SQL Injection Prevention
- Semua operasi database dilakukan melalui Drizzle ORM query builder dengan parameter binding:
  `db.select().from(transactions).where(and(eq(transactions.userId, userId), ...))`
- Dilarang membuat raw SQL concatenation.

---

# 16. Database Design
### Tabel `transactions` (`src/db/schema/transactions.ts`)
```typescript
import { pgTable, serial, integer, varchar, text, timestamp, date } from 'drizzle-orm/pg-core';
import { users } from './users';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense'
  amount: integer('amount').notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  transactionDate: date('transaction_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
```

---

# 17. Database Constraints
- `transactions.id`: Primary Key Auto-increment.
- `transactions.userId`: `NOT NULL` Foreign Key ke `users.id`.
- `transactions.type`: `NOT NULL`.
- `transactions.amount`: `NOT NULL`.
- `transactions.description`: `NOT NULL`.
- `transactions.transactionDate`: `NOT NULL`.

---

# 18. Foreign Key Behavior
- `userId` merujuk ke `users.id`.
- **On Delete Strategy**: `CASCADE`.
- **Alasan**: Jika akun user dihapus, seluruh catatan transaksi milik user tersebut harus otomatis terhapus demi kebersihan data.

---

# 19. Duplicate Handling
- Transaksi dengan nominal dan deskripsi sama pada tanggal yang sama **diperbolehkan** (karena mahasiswa bisa membeli barang yang sama dua kali).
- Masing-masing transaksi dibedakan oleh ID primary key yang unik.

---

# 20. HTTP & Server Action Contract
### Create Transaction
- **Action**: `createTransactionAction(prevState: any, formData: FormData)`
- **Input**: `type`, `amount`, `description`, `transactionDate`
- **Success**: Insert database -> `redirect('/dashboard/transactions?status=created')`
- **Validation Failure**: Return `{ success: false, errors: { ... } }`

### Update Transaction
- **Action**: `updateTransactionAction(id: number, prevState: any, formData: FormData)`
- **Input**: `id`, `type`, `amount`, `description`, `transactionDate`
- **Authorization Check**: Cek kepemilikan record sebelum update.
- **Success**: Update database -> `redirect('/dashboard/transactions?status=updated')`

### Delete Transaction
- **Action**: `deleteTransactionAction(formData: FormData)`
- **Input**: `id`
- **Success**: Delete record -> `revalidatePath('/dashboard/transactions')`

---

# 21. Controller / Action Responsibilities
- File: `src/actions/transactions.ts`
- Mengambil identitas user login (`userId`), memvalidasi input data transaksi, mengeksekusi Drizzle query, memeriksa hak akses kepemilikan, dan memicu revalidasi cache atau redirect.

---

# 22. Model / Schema Responsibilities
- File: `src/db/schema/transactions.ts`
- Mendefinisikan tabel transaksi dan foreign key relasi ke tabel pengguna.

---

# 23. Authorization
- **Strict Owner-Only Access**:
  - Saat membaca list: `where(eq(transactions.userId, currentUserId))`
  - Saat update: `where(and(eq(transactions.id, targetId), eq(transactions.userId, currentUserId)))`
  - Saat delete: `where(and(eq(transactions.id, targetId), eq(transactions.userId, currentUserId)))`
- Jika baris tidak ditemukan atau bukan milik user, tolak aksi dengan melempar respons not found / authorization error.

---

# 24. CSRF
- Next.js Server Actions memvalidasi origin request secara otomatis.

---

# 25. Mass Assignment Protection
- Nilai `userId` HANYA diambil dari session / token JWT yang terverifikasi di server, TIDAK PERNAH diambil dari hidden input form.

---

# 26. Error Handling
- Validasi gagal: Form menampilkan kembali nilai lama dan menunjuk field yang error.
- Akses record tidak sah: Redirect ke halaman daftar transaksi dengan peringatan aman.

---

# 27. Transactions
- Operasi CRUD transaksi pada tabel tunggal tidak membutuhkan multi-step database transaction.

---

# 28. Race Conditions
- Operasi update dan delete dilindungi klausul `WHERE id = ? AND user_id = ?` yang dieksekusi secara atomik oleh PostgreSQL.

---

# 29. Delete Behavior
- **Hard Delete**: Menghapus baris transaksi secara permanen dari tabel.
- Dilengkapi konfirmasi native browser sebelum submit formulir delete.

---

# 30. Empty State
- Tampil ketika query `select().from(transactions).where(eq(transactions.userId, currentUserId))` menghasilkan array kosong (`[]`).
- Menampilkan pesan ramah pengguna dan tombol call-to-action untuk mencatat transaksi baru.

---

# 31. Pagination
- Pada MVP 60 menit, pagination belum diperlukan. Sistem menampilkan 50 transaksi terakhir yang diurutkan secara descending berdasarkan `transactionDate` dan `createdAt`.

---

# 32. Search / Filter
- Fitur filter khusus (Pemasukan/Pengeluaran) akan diintegrasikan pada modul dashboard dan query parameter tabel.

---

# 33. Accessibility Minimum
- Label form terhubung secara tepat ke setiap input.
- Tombol aksi memiliki label teks eksplisit.

---

# 34. Responsive Behavior
- Tabel dibungkus dalam container `<div className="overflow-x-auto">` agar tidak merusak tata letak saat dibuka pada layar ponsel.

---

# 35. Edge Cases
- Nominal bernilai 0: Ditolak backend.
- Tanggal di masa depan: Tetap diperbolehkan jika user mencatat komitmen pengeluaran hari esok, namun format harus valid.
- Deskripsi berisi spasi saja: Ditolak oleh sanitasi `trim()`.

---

# 36. Security Checklist
- [x] Query selalu difilter berdasarkan `userId` pengguna yang login.
- [x] Input `amount` diparsing ke integer murni dan divalidasi `> 0`.
- [x] `userId` diambil dari server-side token context, bukan dari form input.
- [x] Tidak ada raw SQL concatenation.
- [x] Konfirmasi penghapusan data tersedia.

---

# 37. Testing Strategy
## Happy Path
- Menambah transaksi pemasukan Rp100.000 -> data muncul di tabel.
- Mengedit deskripsi transaksi -> perubahan tersimpan dan tampil di tabel.
- Menghapus transaksi -> baris transaksi hilang dari tabel.

## Security & Authorization Test
- Mencoba mengubah ID transaksi milik user lain melalui manipulasi parameter form -> sistem menolak dan data tidak berubah.

---

# 38. Acceptance Criteria
- [ ] User dapat melihat riwayat transaksinya sendiri.
- [ ] User dapat mencatat transaksi pemasukan maupun pengeluaran.
- [ ] Transaksi tersimpan dengan nominal positif yang valid.
- [ ] User dapat mengubah dan menghapus transaksinya sendiri.
- [ ] User tidak dapat melihat atau mengubah transaksi milik akun lain.

---

# 39. Definition of Done
- Skema `transactions` terdaftar di database via Drizzle.
- Rute `/dashboard/transactions`, `/new`, dan `/[id]/edit` dapat diakses dan berfungsi.
- Server Action transaksi selesai dan aman dari manipulasi `userId`.
- Seluruh acceptance criteria terpenuhi.

---

# 40. Implementation Order Inside Feature
1. Buat skema Drizzle di `src/db/schema/transactions.ts`.
2. Buat Server Actions di `src/actions/transactions.ts` (`createTransactionAction`, `updateTransactionAction`, `deleteTransactionAction`).
3. Buat komponen form di `src/components/transactions/transaction-form.tsx`.
4. Buat halaman tambah di `src/app/dashboard/transactions/new/page.tsx`.
5. Buat halaman daftar transaksi di `src/app/dashboard/transactions/page.tsx`.
6. Buat halaman edit di `src/app/dashboard/transactions/[id]/edit/page.tsx`.
7. Pengujian manual CRUD transaksi dan proteksi ID.

---

# 41. Estimated 60-Minute Breakdown
- **00–10 min**: Pembuatan `src/db/schema/transactions.ts` dan eksekusi `drizzle-kit push`.
- **10–25 min**: Implementasi Server Actions lengkap dengan validasi dan query Drizzle.
- **25–40 min**: Pembuatan komponen form dan halaman Create/Edit transaksi.
- **40–50 min**: Pembuatan tabel riwayat transaksi beserta tombol Hapus.
- **50–60 min**: Pengujian manual CRUD dan verifikasi isolasi `userId`.

---

# 42. Explicit Non-Requirements
- Tidak ada multi-kategori kompleks dengan relasi tabel tersendiri (kategori/deskripsi digabung dalam satu field deskripsi).
- Tidak ada lampiran file foto/receipt.
- Tidak ada perhitungan bunga atau cicilan.

---

# EKSKLUSIVITAS FILE (ZERO MERGE CONFLICT)
Programmer yang mengerjakan PRD ini **HANYA** membuat dan mengedit file berikut:
- `src/db/schema/transactions.ts`
- `src/actions/transactions.ts`
- `src/app/dashboard/transactions/page.tsx`
- `src/app/dashboard/transactions/new/page.tsx`
- `src/app/dashboard/transactions/[id]/edit/page.tsx`
- `src/components/transactions/transaction-form.tsx`
- `src/components/transactions/transaction-table.tsx`
- `src/components/transactions/delete-button.tsx`
*(Dilarang mengedit file di folder `(auth)` atau file `dashboard/page.tsx`)*
