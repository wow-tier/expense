import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppAuthProvider } from "@/lib/auth-provider";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import ScanReceipt from "@/pages/scan-receipt";
import ReviewExpense from "@/pages/review-expense";
import Expenses from "@/pages/expenses";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/scan" component={ScanReceipt} />
      <ProtectedRoute path="/review" component={ReviewExpense} />
      <ProtectedRoute path="/expenses" component={Expenses} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
