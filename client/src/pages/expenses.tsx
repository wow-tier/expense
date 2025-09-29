import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExpenseList, type ExpenseFilters } from "@/components/expense-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Expense, ExpenseItem } from "@shared/schema";

export default function Expenses() {
  const [filters, setFilters] = useState<ExpenseFilters>({
    dateFrom: "",
    dateTo: "",
    category: "",
  });
  const { toast } = useToast();

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.dateFrom) queryParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) queryParams.set("dateTo", filters.dateTo);
  if (filters.category) queryParams.set("category", filters.category);

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<(Expense & { items: ExpenseItem[] })[]>({
    queryKey: ["/api/expenses", ...Object.values(filters)],
    queryFn: async () => {
      const response = await fetch(`/api/expenses?${queryParams.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      return response.json();
    },
  });

  const { data: stats } = useQuery<{
    total: string;
    count: number;
    average: string;
  }>({
    queryKey: ["/api/expenses/stats", ...Object.values(filters)],
    queryFn: async () => {
      const response = await fetch(`/api/expenses/stats?${queryParams.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch expense stats");
      }
      return response.json();
    },
  });

  const handleExport = async () => {
    try {
      toast({
        title: "Exporting expenses",
        description: "Preparing your Excel file...",
      });

      const response = await fetch(`/api/expenses/export?${queryParams.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to export expenses");
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `expenses-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: "Your expense data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export expense data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3" data-testid="button-back-to-dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">All Expenses</h1>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <ExpenseList
          expenses={expenses}
          stats={stats || { total: "0", count: 0, average: "0" }}
          onExport={handleExport}
          onFilterChange={handleFilterChange}
          isLoading={expensesLoading}
        />
      </div>
    </div>
  );
}
