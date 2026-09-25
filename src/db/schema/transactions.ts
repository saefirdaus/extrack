import { pgTable, serial, integer, varchar, timestamp, date } from 'drizzle-orm/pg-core';
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
