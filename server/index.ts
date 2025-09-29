import express, { type Request, Response, NextFunction, Express } from "express";
import session from "express-session";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";

const app: Express = express();

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logging for /api routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
      log(logLine);
    }
  });

  next();
});

// Setup authentication (sessions + passport + auth routes)
setupAuth(app);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// Setup Vite dev server or serve static build
(async () => {
  if (app.get("env") === "development") {
    await setupVite(app, app);
  } else {
    serveStatic(app);
  }

  // Listen on PORT from env or default 4100
  const port = parseInt(process.env.PORT || "4100", 10);
  app.listen(port, "0.0.0.0", () => log(`Expense app running on port ${port}`));
})();
