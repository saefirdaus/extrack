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
<<<<<<< HEAD
    year: integer('year').notNull(),   // e.g. 2026
    amount: integer('amount').notNull(),
=======
    year: integer('year').notNull(), // 2020 - 2099
    amount: integer('amount').notNull(), // target plafon anggaran dalam rupiah
>>>>>>> feat/monthly-budget
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
<<<<<<< HEAD
    uniqueIndex('user_month_year_budget_idx').on(table.userId, table.month, table.year),
=======
    uniqueIndex('user_month_year_idx').on(table.userId, table.month, table.year),
>>>>>>> feat/monthly-budget
  ]
);

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
