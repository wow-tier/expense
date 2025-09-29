import express, { type Request, Response, NextFunction, Express } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app: Express = express();

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging for /api routes
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json.bind(res);
  let captured: any;
  res.json = (body, ...args) => {
    captured = body;
    return originalJson(body, ...args);
  };
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      let line = `${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (captured) line += ` :: ${JSON.stringify(captured)}`;
      if (line.length > 120) line = line.slice(0, 119) + "…";
      log(line);
    }
  });
  next();
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
  console.error(err);
});

// SPA or Vite setup and server startup
(async () => {
  // Mount all routes (auth + API routes)
  const httpServer = await registerRoutes(app);

  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app); // This should include a catch-all for the frontend
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, "0.0.0.0", () => log(`Expense app running on port ${port}`));
})();