import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertExpenseSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import ExcelJS from "exceljs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and PDF files are allowed.'));
    }
  },
});

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Expense routes
  app.post("/api/expenses", isAuthenticated, upload.single('receipt'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertExpenseSchema.parse(req.body);
      
      // Convert date string to Date object
      const expenseData = {
        ...validatedData,
        userId,
        date: new Date(validatedData.date),
        receiptImageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      };

      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  app.get("/api/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { dateFrom, dateTo, category } = req.query;
      
      const filters: any = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (category) filters.category = category;

      const expenses = await storage.getUserExpenses(userId, filters);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { dateFrom, dateTo, category } = req.query;
      
      const filters: any = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (category) filters.category = category;

      const stats = await storage.getUserExpenseStats(userId, filters);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching expense stats:", error);
      res.status(500).json({ message: "Failed to fetch expense statistics" });
    }
  });

  app.get("/api/expenses/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { dateFrom, dateTo, category } = req.query;
      
      const filters: any = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (category) filters.category = category;

      const expenses = await storage.getUserExpenses(userId, filters);

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Expenses');

      // Add headers
      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Vendor', key: 'vendor', width: 20 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Total', key: 'total', width: 12 },
        { header: 'Items', key: 'items', width: 50 },
      ];

      // Add data
      expenses.forEach(expense => {
        const itemsText = expense.items.map(item => 
          `${item.name} (${item.quantity || '1'}) - $${item.price}`
        ).join('; ');

        worksheet.addRow({
          date: expense.date.toLocaleDateString(),
          vendor: expense.vendor,
          category: expense.category,
          total: `$${expense.total}`,
          items: itemsText,
        });
      });

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Set response headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=expenses-${new Date().toISOString().split('T')[0]}.xlsx`);

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error exporting expenses:", error);
      res.status(500).json({ message: "Failed to export expenses" });
    }
  });

  app.get("/api/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const expenseId = req.params.id;

      const expense = await storage.getExpenseById(expenseId, userId);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  app.put("/api/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const expenseId = req.params.id;
      const validatedData = insertExpenseSchema.partial().parse(req.body);

      // Convert date string to Date object if provided
      const updates = {
        ...validatedData,
        ...(validatedData.date && { date: new Date(validatedData.date) }),
      };

      const expense = await storage.updateExpense(expenseId, userId, updates);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update expense" });
      }
    }
  });

  app.delete("/api/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const expenseId = req.params.id;

      const deleted = await storage.deleteExpense(expenseId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
