import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vendor: text("vendor").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  category: text("category").notNull(),
  receiptImageUrl: text("receipt_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenseItems = pgTable("expense_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseId: varchar("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: text("quantity"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  items: many(expenseItems),
}));

export const expenseItemsRelations = relations(expenseItems, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseItems.expenseId],
    references: [expenses.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
}).extend({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  items: z.array(z.object({
    name: z.string(),
    quantity: z.string().optional(),
    price: z.string(),
  })),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseItem = typeof expenseItems.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
