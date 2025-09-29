import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Camera, List, DollarSign, Receipt, ShoppingCart, Car, Coffee, Bell, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { Expense, ExpenseItem } from "@shared/schema";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<(Expense & { items: ExpenseItem[] })[]>({
    queryKey: ["/api/expenses"],
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    total: string;
    count: number;
    average: string;
  }>({
    queryKey: ["/api/expenses/stats"],
    enabled: !!user,
  });

  const recentExpenses = expenses.slice(0, 3);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "groceries":
        return <ShoppingCart className="h-4 w-4" />;
      case "gas":
        return <Car className="h-4 w-4" />;
      case "dining":
        return <Coffee className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.fullName || user?.username}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-lg font-semibold" data-testid="text-monthly-total">
                    {statsLoading ? "..." : `$${stats?.total || "0.00"}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-muted-foreground">Receipts</p>
                  <p className="text-lg font-semibold" data-testid="text-receipt-count">
                    {statsLoading ? "..." : stats?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/scan">
                <Button className="w-full h-20 flex-col" data-testid="button-scan-receipt">
                  <Camera className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">Scan Receipt</span>
                </Button>
              </Link>
              <Link to="/expenses">
                <Button variant="secondary" className="w-full h-20 flex-col" data-testid="button-view-expenses">
                  <List className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">View Expenses</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Expenses</CardTitle>
              <Link to="/expenses">
                <Button variant="ghost" size="sm" data-testid="button-view-all-expenses">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : recentExpenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No expenses yet</p>
                <p className="text-sm text-muted-foreground">Scan your first receipt to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense, index) => (
                  <div key={expense.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium" data-testid={`text-recent-vendor-${index}`}>
                            {expense.vendor}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-recent-date-${index}`}>
                            {formatDate(expense.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" data-testid={`text-recent-amount-${index}`}>
                          ${expense.total}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {expense.category}
                        </Badge>
                      </div>
                    </div>
                    {index < recentExpenses.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
