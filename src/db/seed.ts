import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { users } from "./schema/users";

const DEFAULT_SEED_USER = {
  name: "Extrack Demo",
  email: "demo@extrack.local",
  password: "password123",
};

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 100;

function getDatabaseUrl(): string {
  const configuredUrl = process.env.DATABASE_URL?.trim();

  if (configuredUrl && !configuredUrl.includes("${")) {
    return configuredUrl;
  }

  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "5432";
  const user = process.env.DB_USER || "postgres";
  const password = process.env.DB_PASSWORD || "postgres";
  const databaseName = process.env.DB_NAME || "extrack_db";

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(databaseName)}`;
}

function getSeedUser() {
  const name = process.env.SEED_USER_NAME?.trim() || DEFAULT_SEED_USER.name;
  const email =
    process.env.SEED_USER_EMAIL?.trim().toLowerCase() ||
    DEFAULT_SEED_USER.email;
  const password =
    process.env.SEED_USER_PASSWORD || DEFAULT_SEED_USER.password;

  if (!name || name.length > 100) {
    throw new Error("SEED_USER_NAME harus berisi 1-100 karakter.");
  }

  if (!email) {
    throw new Error("SEED_USER_EMAIL wajib diisi.");
  }

  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new Error(
      `SEED_USER_PASSWORD harus berisi ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} karakter.`,
    );
  }

  return { name, email, password };
}

async function seedDemoUser(): Promise<void> {
  const seedUser = getSeedUser();
  const pool = new Pool({ connectionString: getDatabaseUrl() });
  const db = drizzle({ client: pool });

  try {
    const hashedPassword = await bcrypt.hash(seedUser.password, 10);
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, seedUser.email))
      .limit(1);

    if (existingUser.length > 0) {
      await db
        .update(users)
        .set({
          name: seedUser.name,
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.email, seedUser.email));

      console.log(`Akun seeder diperbarui: ${seedUser.email}`);
      return;
    }

    await db.insert(users).values({
      name: seedUser.name,
      email: seedUser.email,
      password: hashedPassword,
    });

    console.log("Akun seeder berhasil dibuat:");
    console.log(`  Email: ${seedUser.email}`);
    console.log(`  Password: ${seedUser.password}`);
  } finally {
    await pool.end();
  }
}

seedDemoUser().catch((error: unknown) => {
  console.error("Seeder gagal dijalankan.");
  console.error(error);
  process.exitCode = 1;
});
