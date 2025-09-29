import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpenseForm } from "@/components/expense-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertExpense } from "@shared/schema";
import type { OCRResult } from "@/lib/ocr";

export default function ReviewExpense() {
  const [, setLocation] = useLocation();
  const [extractedData, setExtractedData] = useState<OCRResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get data from navigation state
  useEffect(() => {
    const state = history.state as { extractedData?: OCRResult };
    if (state?.extractedData) {
      setExtractedData(state.extractedData);
    } else {
      // If no data, redirect to scan page
      setLocation("/scan");
    }
  }, [setLocation]);

  const saveExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const res = await apiRequest("POST", "/api/expenses", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Expense saved successfully",
        description: "Your expense has been added to your records.",
      });
      
      // Invalidate expenses queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses/stats"] });
      
      // Navigate back to dashboard
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Failed to save expense",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertExpense) => {
    saveExpenseMutation.mutate(data);
  };

  const handleCancel = () => {
    setLocation("/scan");
  };

  if (!extractedData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading extracted data...</p>
        </div>
      </div>
    );
  }

  // Convert OCR result to expense form data
  const initialExpenseData: Partial<InsertExpense> = {
    vendor: extractedData.vendor,
    total: extractedData.total,
    date: new Date(`${extractedData.date}T${extractedData.time}`),
    category: "other", // Default category
    items: extractedData.items,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/scan">
              <Button variant="ghost" size="sm" className="mr-3" data-testid="button-back-to-scan">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Review & Save</h1>
          </div>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
            OCR Complete
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        <ExpenseForm
          initialData={initialExpenseData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={saveExpenseMutation.isPending}
        />
      </div>
    </div>
  );
}
