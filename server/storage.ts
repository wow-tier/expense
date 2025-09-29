import { users, expenses, expenseItems, type User, type InsertUser, type Expense, type InsertExpense, type ExpenseItem } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Expense operations
  createExpense(expense: InsertExpense & { userId: string }): Promise<Expense>;
  getUserExpenses(userId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
  }): Promise<(Expense & { items: ExpenseItem[] })[]>;
  getExpenseById(id: string, userId: string): Promise<(Expense & { items: ExpenseItem[] }) | undefined>;
  updateExpense(id: string, userId: string, updates: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string, userId: string): Promise<boolean>;
  
  // Analytics
  getUserExpenseStats(userId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
  }): Promise<{
    total: string;
    count: number;
    average: string;
  }>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createExpense(expenseData: InsertExpense & { userId: string }): Promise<Expense> {
    const { items, ...expense } = expenseData;
    
    const [createdExpense] = await db
      .insert(expenses)
      .values(expense)
      .returning();

    if (items && items.length > 0) {
      await db
        .insert(expenseItems)
        .values(items.map(item => ({
          expenseId: createdExpense.id,
          ...item,
        })));
    }

    return createdExpense;
  }

  async getUserExpenses(userId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
  }): Promise<(Expense & { items: ExpenseItem[] })[]> {
    let query = db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date));

    if (filters) {
      const conditions = [eq(expenses.userId, userId)];
      
      if (filters.dateFrom) {
        conditions.push(gte(expenses.date, new Date(filters.dateFrom)));
      }
      
      if (filters.dateTo) {
        conditions.push(lte(expenses.date, new Date(filters.dateTo)));
      }
      
      if (filters.category) {
        conditions.push(eq(expenses.category, filters.category));
      }

      query = db
        .select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.date));
    }

    const expensesList = await query;
    
    // Get items for each expense
    const expensesWithItems = await Promise.all(
      expensesList.map(async (expense) => {
        const items = await db
          .select()
          .from(expenseItems)
          .where(eq(expenseItems.expenseId, expense.id));
        
        return { ...expense, items };
      })
    );

    return expensesWithItems;
  }

  async getExpenseById(id: string, userId: string): Promise<(Expense & { items: ExpenseItem[] }) | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

    if (!expense) return undefined;

    const items = await db
      .select()
      .from(expenseItems)
      .where(eq(expenseItems.expenseId, expense.id));

    return { ...expense, items };
  }

  async updateExpense(id: string, userId: string, updates: Partial<InsertExpense>): Promise<Expense | undefined> {
    const { items, ...expenseUpdates } = updates;
    
    const [updatedExpense] = await db
      .update(expenses)
      .set(expenseUpdates)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();

    if (!updatedExpense) return undefined;

    if (items) {
      // Delete existing items
      await db
        .delete(expenseItems)
        .where(eq(expenseItems.expenseId, id));

      // Insert new items
      if (items.length > 0) {
        await db
          .insert(expenseItems)
          .values(items.map(item => ({
            expenseId: id,
            ...item,
          })));
      }
    }

    return updatedExpense;
  }

  async deleteExpense(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

    return (result.rowCount || 0) > 0;
  }

  async getUserExpenseStats(userId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    category?: string;
  }): Promise<{
    total: string;
    count: number;
    average: string;
  }> {
    let query = db
      .select({
        total: sql<string>`COALESCE(SUM(${expenses.total}), 0)`,
        count: sql<number>`COUNT(*)`,
        average: sql<string>`COALESCE(AVG(${expenses.total}), 0)`,
      })
      .from(expenses)
      .where(eq(expenses.userId, userId));

    if (filters) {
      const conditions = [eq(expenses.userId, userId)];
      
      if (filters.dateFrom) {
        conditions.push(gte(expenses.date, new Date(filters.dateFrom)));
      }
      
      if (filters.dateTo) {
        conditions.push(lte(expenses.date, new Date(filters.dateTo)));
      }
      
      if (filters.category) {
        conditions.push(eq(expenses.category, filters.category));
      }

      query = db
        .select({
          total: sql<string>`COALESCE(SUM(${expenses.total}), 0)`,
          count: sql<number>`COUNT(*)`,
          average: sql<string>`COALESCE(AVG(${expenses.total}), 0)`,
        })
        .from(expenses)
        .where(and(...conditions));
    }

    const [stats] = await query;
    return stats || { total: "0", count: 0, average: "0" };
  }
}

export const storage = new DatabaseStorage();
