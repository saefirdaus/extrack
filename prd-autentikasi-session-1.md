# FILE: prd-autentikasi-session-1.md

# 1. Feature Overview
- **Nama Fitur**: Autentikasi Pengguna & Manajemen Session (Register, Login, Session JWT, Route Protection, Logout).
- **Tujuan Fitur**: Memungkinkan mahasiswa membuat akun baru, masuk ke sistem secara aman, mempertahankan session aktif melalui JWT stateless di httpOnly cookie, memproteksi halaman internal, dan keluar dari aplikasi.
- **Masalah yang Diselesaikan**: Mencegah akses liar tanpa akun, mengidentifikasi identitas pengguna (`userId`) untuk isolasi data keuangan pribadi, dan mengamankan rute terproteksi.
- **Pengguna/Aktor**: Mahasiswa (Pengguna Publik / Terdaftar).
- **Dependency**: Fondasi awal (Urutan 1). Memiliki isolasi file penuh sehingga dapat dikerjakan secara paralel dengan fitur transaksi dan dashboard tanpa merge conflict.
- **Alasan Urutan Implementasi**: Menyediakan identitas pengguna (`userId`) dan token JWT yang digunakan oleh seluruh modul lainnya.

---

# 2. User Story
- **US-01 (Register)**: Sebagai mahasiswa baru, saya ingin mendaftarkan akun dengan nama, email, dan password, sehingga saya memiliki akun untuk mencatat keuangan pribadi.
- **US-02 (Login)**: Sebagai mahasiswa terdaftar, saya ingin login menggunakan email dan password, sehingga saya dapat masuk ke dashboard akun saya.
- **US-03 (Session & Route Protection)**: Sebagai pengguna yang telah login, saya ingin sistem menjaga session saya tetap aktif saat membuka halaman aplikasi, dan menolak akses jika saya belum login.
- **US-04 (Logout)**: Sebagai pengguna, saya ingin dapat keluar dari akun saya kapan saja, sehingga akun saya aman saat menggunakan perangkat bersama.

---

# 3. Scope
## MVP / Required (Harus selesai dalam 60 menit)
- Form Registrasi (`/register`): Input nama, email, password. Password di-hash dengan `bcryptjs`. Simpan ke tabel `users`.
- Form Login (`/login`): Verifikasi email & password. Jika valid, buat token JWT (berisi payload `{ userId, email, name }`) dan set ke cookie `httpOnly`, `SameSite=Lax`, `path=/`.
- Route Protection (`middleware.ts`): Proteksi rute `/dashboard/:path*`. Jika cookie JWT tidak valid/hilang, redirect ke `/login`. Jika sudah login dan membuka `/login` atau `/register`, redirect ke `/dashboard`.
- Logout (`actions/auth.ts` -> `logoutAction`): Hapus cookie JWT dan redirect ke `/login`.
- Flash/Banner Error pada form login & register jika autentikasi gagal atau email duplikat.

## If Time Permits
- Tombol toggle show/hide password (eye icon) berbasis JavaScript native sederhana.
- Validasi konfirmasi password (`password_confirmation`).

## Out of Scope
- Fitur Lupa Password / Reset Password via email.
- Verifikasi Email (Email Verification link/OTP).
- Refresh Token & Token Rotation.
- Multi-factor Authentication (2FA) / OAuth (Google/Github).

---

# 4. Preconditions
- Database PostgreSQL berjalan via Docker Compose (`docker compose up -d`).
- Drizzle ORM terhubung ke database.
- Secret key `JWT_SECRET` tersedia di `.env` (fallback default tersedia untuk dev lokal).

---

# 5. Main User Flow
1. User membuka `/register`.
2. User menginput nama, email, dan password, lalu klik **Daftar**.
3. Browser mengirim form submission via Next.js Server Action (`registerAction`).
4. Server Action memvalidasi input. Jika valid, password di-hash, data di-insert ke tabel `users`.
5. Server Action membuat token JWT, menyimpannya di cookie `httpOnly: auth_token`, lalu redirect ke `/dashboard`.
6. Untuk user lama: User membuka `/login`, menginput email dan password, lalu klik **Masuk**.
7. Server Action `loginAction` memverifikasi email dan password hash. Jika cocok, cookie `auth_token` di-set, lalu redirect ke `/dashboard`.
8. Saat user berada di `/dashboard` dan menekan tombol **Keluar**, Server Action `logoutAction` menghapus cookie `auth_token` dan me-redirect browser kembali ke `/login`.

---

# 6. Alternative Flow
- **Email Duplikat saat Register**: Backend mendeteksi email sudah terdaftar di database -> mengembalikan error "Email sudah terdaftar" -> ditampilkan pada error container email di form register.
- **Password Salah saat Login**: Backend mendeteksi hash password tidak cocok -> mengembalikan error umum "Email atau password salah" (tidak membocorkan apakah email terdaftar atau tidak).
- **Akses Langsung ke /dashboard tanpa Login**: `middleware.ts` mendeteksi ketiadaan cookie `auth_token` -> langsung intercept request dan redirect ke `/login`.
- **Token JWT Expired/Tampered**: `middleware.ts` gagal memverifikasi signature token -> hapus cookie dan redirect ke `/login`.

---

# 7. Low-Fidelity UI Design

### Halaman Register (`/register`)
```text
+------------------------------------------------------+
|                     EXTRACK                          |
|             Daftar Akun Mahasiswa                    |
+------------------------------------------------------+
| [ Form-level Error Alert: jika registrasi gagal    ] |
|                                                      |
| Nama Lengkap                                         |
| [ John Doe                                         ] |
| [ Error: Nama wajib diisi                          ] |
|                                                      |
| Email Mahasiswa                                      |
| [ john@kampus.ac.id                                ] |
| [ Error: Format email tidak valid                  ] |
|                                                      |
| Password                                             |
| [ **********                                       ] |
| [ Error: Password minimal 6 karakter               ] |
|                                                      |
| [                  DAFTAR SEKARANG                 ] |
|                                                      |
| Sudah punya akun? [Masuk di sini]                    |
+------------------------------------------------------+
```

### Halaman Login (`/login`)
```text
+------------------------------------------------------+
|                     EXTRACK                          |
|             Masuk ke Akun Anda                       |
+------------------------------------------------------+
| [ Form-level Error Alert: Email/password salah     ] |
|                                                      |
| Email                                                |
| [ john@kampus.ac.id                                ] |
| [ Error: Email wajib diisi                         ] |
|                                                      |
| Password                                             |
| [ **********                                       ] |
| [ Error: Password wajib diisi                      ] |
|                                                      |
| [                      MASUK                       ] |
|                                                      |
| Belum punya akun? [Daftar akun baru]                 |
+------------------------------------------------------+
```

---

# 8. Visual Design & Tailwind Guidance
- **Page Layout**: `min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8`
- **Card Container**: `bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100 max-w-md w-full`
- **Header**: `text-center text-2xl font-bold tracking-tight text-gray-900 mb-2`
- **Sub-header**: `text-center text-sm text-gray-500 mb-6`
- **Input Field**: `block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition`
- **Input Error State**: `border-red-500 focus:ring-red-500 text-red-900`
- **Field Error Text**: `mt-1 text-xs text-red-600 font-medium`
- **Primary Submit Button**: `w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition`
- **Form Alert (Global Error)**: `p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 mb-4`

---

# 9. UI States
- **Default State**: Input kosong dengan placeholder standar.
- **Submitting State**: Tombol submit menampilkan status disabled dengan teks *"Memproses..."*.
- **Validation Error State**: Kotak input berwarna merah dan pesan spesifik muncul tepat di bawah field yang bermasalah.
- **Authentication Error State**: Kotak alert merah di atas form bertuliskan *"Email atau password salah"*.
- **Success State**: Tidak ada tampilan sukses berlama-lama; langsung melakukan Server Redirect (`redirect('/dashboard')`).
- **AJAX Loading Spinner**: **Tidak diperlukan**, karena menggunakan Next.js Server Action form action standar.

---

# 10. Error Container Specification
- **Field-level Error**: Setiap field (`name`, `email`, `password`) memiliki kontainer `<p className="mt-1 text-xs text-red-600">` yang hanya dirender saat state error untuk key tersebut terisi.
- **Form-level Global Error**: Kontainer `<div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">` di bagian paling atas card, tepat sebelum elemen input pertama.
- **Sensitive Technical Error**: Jika terjadi error koneksi database, backend HANYA mengembalikan: *"Terjadi kesalahan pada server. Silakan coba beberapa saat lagi."* Dilarang keras menampilkan stack trace atau SQL error.

---

# 11. Form Specification
### Register Form
1. **Name**:
   - `name="name"`, `type="text"`, required, `maxlength="100"`, placeholder: `Nama Lengkap`.
2. **Email**:
   - `name="email"`, `type="email"`, required, `maxlength="150"`, placeholder: `nama@mahasiswa.ac.id`, `autocomplete="email"`.
3. **Password**:
   - `name="password"`, `type="password"`, required, `minlength="6"`, placeholder: `Minimal 6 karakter`, `autocomplete="new-password"`.

### Login Form
1. **Email**:
   - `name="email"`, `type="email"`, required, placeholder: `nama@mahasiswa.ac.id`, `autocomplete="email"`.
2. **Password**:
   - `name="password"`, `type="password"`, required, placeholder: `Masukkan password`, `autocomplete="current-password"`.

---

# 12. Frontend Validation
- `required` pada seluruh input form.
- `type="email"` pada field email untuk memicu validasi format native browser.
- `minlength="6"` pada password di form register.
- `maxlength="100"` pada nama.

---

# 13. Backend Validation
Divalidasi di dalam Server Action (`src/actions/auth.ts`) sebelum query database:
- `name`: string, `trim()`, wajib diisi, minimal 2 karakter, maksimal 100 karakter.
- `email`: string, `trim()`, `toLowerCase()`, format email valid (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), maksimal 150 karakter.
- `password`: string, wajib diisi, minimal 6 karakter, maksimal 100 karakter.

---

# 14. Input Sanitization & XSS Prevention
- Seluruh input teks dilakukan `trim()`. Email selalu di-`toLowerCase()`.
- Data nama yang dirender di UI selalu memanfaatkan escaping otomatis React JSX (`{user.name}`).
- Dilarang keras menggunakan `dangerouslySetInnerHTML`.

---

# 15. SQL Injection Prevention
- Seluruh operasi database dilakukan menggunakan **Drizzle ORM query builder** dengan query terparameter (`eq(users.email, email)`).
- Tidak boleh ada query string concatenation manual.

---

# 16. Database Design
### Tabel `users` (`src/db/schema/users.ts`)
```typescript
import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

---

# 17. Database Constraints
- `users.id`: Primary Key, Auto Increment (`serial`).
- `users.email`: `NOT NULL` & `UNIQUE INDEX` (mencegah duplikasi data pada level database).
- `users.name`: `NOT NULL`.
- `users.password`: `NOT NULL`.

---

# 18. Foreign Key Behavior
- Tabel `users` adalah tabel master (root entity). Tidak memiliki foreign key ke tabel lain.

---

# 19. Duplicate Handling
- **Definisi Duplikat**: Pengguna mendaftar dengan alamat email yang sudah ada di tabel `users`.
- **Handling**:
  1. Cek via query Drizzle `db.select().from(users).where(eq(users.email, email)).limit(1)`.
  2. Jika ditemukan, batalkan proses dan kembalikan error: `{ errors: { email: ['Email ini sudah terdaftar. Silakan gunakan email lain.'] } }`.
  3. Jika terjadi race-condition, tangkap error database constraint violation (`23505` PostgreSQL unique violation) dan kembalikan pesan yang sama secara aman.

---

# 20. HTTP & Server Action Contract
### Action: Register (`src/actions/auth.ts`)
- **Function**: `export async function registerAction(prevState: any, formData: FormData)`
- **Input**: `name`, `email`, `password`
- **Success**: Set cookie `auth_token` -> `redirect('/dashboard')`
- **Validation Failure**: Mengembalikan `{ success: false, errors: { name?: [...], email?: [...], password?: [...] } }`
- **Server Error**: Mengembalikan `{ success: false, message: 'Gagal memproses pendaftaran. Coba lagi.' }`

### Action: Login (`src/actions/auth.ts`)
- **Function**: `export async function loginAction(prevState: any, formData: FormData)`
- **Input**: `email`, `password`
- **Success**: Set cookie `auth_token` -> `redirect('/dashboard')`
- **Auth Failure**: Mengembalikan `{ success: false, message: 'Email atau password yang Anda masukkan salah.' }`

### Action: Logout (`src/actions/auth.ts`)
- **Function**: `export async function logoutAction()`
- **Success**: Hapus cookie `auth_token` -> `redirect('/login')`

---

# 21. Controller / Action Responsibilities
- File: `src/actions/auth.ts`
- Bertanggung jawab memvalidasi input, melakukan hashing password (`bcryptjs`), menjalankan Drizzle query, membuat payload JWT, mengatur header cookies via `cookies()` dari `next/headers`, dan melakukan redirect.

---

# 22. Model / Schema Responsibilities
- File: `src/db/schema/users.ts`
- Bertanggung jawab mendefinisikan skema tabel `users`, tipe TypeScript (`User`, `NewUser`), dan constraint kolom.

---

# 23. Authorization
- Fitur ini adalah gerbang autentikasi publik.
- Rute `/login` dan `/register` hanya boleh diakses oleh user yang **belum login**. Jika user ber-token valid mengakses rute ini, middleware langsung mengarahkan ke `/dashboard`.

---

# 24. CSRF
- Next.js Server Actions memiliki proteksi CSRF bawaan yang memvalidasi kesesuaian header `Origin` dan `Host`.

---

# 25. Mass Assignment Protection
- Pembuatan user baru di database dilakukan dengan payload eksplisit:
  ```typescript
  await db.insert(users).values({
    name: validatedName,
    email: validatedEmail,
    password: hashedPassword,
  });
  ```
- Dilarang memasukkan objek mentah dari request.

---

# 26. Error Handling
- Validasi gagal: Form tetap mempertahankan value nama & email (old input) via state React `useActionState`. Password dikosongkan kembali demi keamanan.
- Kesalahan database / jaringan: Ditangkap dalam blok `try...catch` dan menghasilkan pesan ramah pengguna tanpa stack trace.

---

# 27. Transactions
- Operasi registrasi dan login hanya melibatkan satu tabel tunggal (`users`), sehingga tidak memerlukan transaksi multi-tabel (`db.transaction`).

---

# 28. Race Conditions
- Dua pendaftaran bersamaan dengan email yang sama diatasi secara deterministik oleh database `UNIQUE (email)` constraint.

---

# 29. Delete Behavior
- Tidak ada fitur penghapusan user pada scope praktikum ini.

---

# 30. Empty State
- Tidak relevan untuk halaman form autentikasi.

---

# 31. Pagination
- Tidak relevan untuk autentikasi.

---

# 32. Search / Filter
- Tidak relevan untuk autentikasi.

---

# 33. Accessibility Minimum
- Semua input memiliki `<label htmlFor="...">` yang terhubung secara semantik dengan `id` input.
- Tombol memiliki teks jelas: "Masuk", "Daftar Sekarang", "Keluar".
- Kotak pesan error memiliki styling kontras warna yang mudah terbaca.

---

# 34. Responsive Behavior
- Tampilan form terpusat (`flex justify-center items-center`) dengan lebar maksimal `max-w-md` di desktop dan adaptif `w-full px-4` pada layar mobile.

---

# 35. Edge Cases
- Email dimasukkan dengan huruf kapital acak (misal: `User@Domain.Com`): Harus diubah menjadi `user@domain.com` secara otomatis.
- Spasi ekstra sebelum/setelah nama dan email: Dilakukan `trim()`.
- Password berisi karakter spasi saja: Ditolak oleh validasi panjang minimal.

---

# 36. Security Checklist
- [x] Password selalu di-hash menggunakan `bcryptjs` (salt rounds minimal 10).
- [x] JWT disimpan di cookie dengan atribut `httpOnly: true`, `SameSite: 'lax'`, `path: '/'`.
- [x] JWT payload HANYA berisi data non-sensitif (`userId`, `email`, `name`). Tidak ada password hash di dalam JWT.
- [x] Route `/dashboard/*` diproteksi secara menyeluruh oleh `middleware.ts`.
- [x] Unique constraint pada email di database aktif.
- [x] Tidak ada raw SQL concatenation.

---

# 37. Testing Strategy
## Happy Path
- Submit form register valid -> record tersimpan di tabel `users`, cookie `auth_token` terbit, user berada di `/dashboard`.
- Submit form login valid -> cookie `auth_token` terbit, user diarahkan ke `/dashboard`.
- Klik tombol logout -> cookie `auth_token` terhapus, diarahkan ke `/login`.

## Validation Tests
- Register dengan email kosong / format salah -> form menampilkan pesan error.
- Register dengan password < 6 karakter -> form menampilkan pesan error.
- Login dengan password salah -> form menampilkan alert error "Email atau password salah".

## Security & Route Tests
- Buka `/dashboard` saat belum login -> otomatis redirect ke `/login`.
- Manipulasi nilai cookie `auth_token` secara acak -> sistem menolak dan redirect ke `/login`.

---

# 38. Acceptance Criteria
- [ ] User dapat mendaftar akun baru dengan nama, email, dan password.
- [ ] Password tersimpan dalam bentuk hash di database.
- [ ] User dapat login menggunakan email dan password yang terdaftar.
- [ ] Sistem menyimpan token JWT di cookie `httpOnly` bernama `auth_token`.
- [ ] Rute `/dashboard` tidak dapat diakses tanpa token valid.
- [ ] Tombol logout menghapus token dan mengeluarkan user dari dashboard.

---

# 39. Definition of Done
- Migration/push Drizzle untuk tabel `users` berhasil dijalankan.
- File route `src/app/(auth)/login/page.tsx` dan `src/app/(auth)/register/page.tsx` berfungsi.
- File Server Action `src/actions/auth.ts` selesai dan teruji.
- File `src/middleware.ts` berhasil memproteksi rute dashboard.
- Tidak ada error TypeScript dan linter.

---

# 40. Implementation Order Inside Feature
1. Buat skema `src/db/schema/users.ts`.
2. Buat utility JWT `src/lib/auth/jwt.ts` (`signToken`, `verifyToken`).
3. Buat Server Action `src/actions/auth.ts` (`registerAction`, `loginAction`, `logoutAction`).
4. Buat halaman `src/app/(auth)/register/page.tsx`.
5. Buat halaman `src/app/(auth)/login/page.tsx`.
6. Buat `src/middleware.ts` untuk route protection.
7. Pengujian manual register, login, middleware redirect, dan logout.

---

# 41. Estimated 60-Minute Breakdown
- **00–10 min**: Setup `schema/users.ts`, Drizzle push, dan install/setup `bcryptjs` + `jsonwebtoken`.
- **10–25 min**: Implementasi `src/lib/auth/jwt.ts` dan Server Actions (`registerAction`, `loginAction`, `logoutAction`).
- **25–45 min**: Pembuatan UI Tailwind untuk `/register` dan `/login` beserta penanganan error container.
- **45–55 min**: Implementasi `src/middleware.ts` untuk proteksi rute dashboard.
- **55–60 min**: Pengujian alur registrasi -> login -> dashboard -> logout.

---

# 42. Explicit Non-Requirements
- Tidak menggunakan database session table (murni stateless JWT di cookie).
- Tidak ada fitur refresh token.
- Tidak ada OAuth / Social Login (Google, GitHub, dsb.).
- Tidak ada email verification service / OTP.

---

# EKSKLUSIVITAS FILE (ZERO MERGE CONFLICT)
Programmer yang mengerjakan PRD ini **HANYA** membuat dan mengedit file berikut:
- `src/db/schema/users.ts`
- `src/lib/auth/jwt.ts`
- `src/lib/auth/session.ts`
- `src/actions/auth.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/middleware.ts`
*(Dilarang mengedit file di folder `/dashboard/` atau file schema `transactions.ts`)*
