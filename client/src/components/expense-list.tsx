import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, Filter, ShoppingCart, Car, Coffee, Package, Zap, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { Expense, ExpenseItem } from "@shared/schema";

interface ExpenseListProps {
  expenses: (Expense & { items: ExpenseItem[] })[];
  stats: {
    total: string;
    count: number;
    average: string;
  };
  onExport: () => void;
  onFilterChange: (filters: ExpenseFilters) => void;
  isLoading?: boolean;
}

export interface ExpenseFilters {
  dateFrom: string;
  dateTo: string;
  category: string;
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "groceries", label: "Groceries" },
  { value: "gas", label: "Gas & Transportation" },
  { value: "dining", label: "Dining & Food" },
  { value: "shopping", label: "Shopping" },
  { value: "utilities", label: "Utilities" },
  { value: "other", label: "Other" },
];

const CATEGORY_ICONS = {
  groceries: ShoppingCart,
  gas: Car,
  dining: Coffee,
  shopping: Package,
  utilities: Zap,
  other: MoreHorizontal,
};

const CATEGORY_COLORS = {
  groceries: "bg-green-100 text-green-800",
  gas: "bg-blue-100 text-blue-800",
  dining: "bg-orange-100 text-orange-800",
  shopping: "bg-purple-100 text-purple-800",
  utilities: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800",
};

export function ExpenseList({ expenses, stats, onExport, onFilterChange, isLoading }: ExpenseListProps) {
  const [filters, setFilters] = useState<ExpenseFilters>({
    dateFrom: "",
    dateTo: "",
    category: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (field: keyof ExpenseFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || MoreHorizontal;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other;
  };

  return (
    <div className="space-y-6">
      {/* Header with Export and Filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Expenses</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            data-testid="button-export-expenses"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">From Date</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  data-testid="input-filter-date-from"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">To Date</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  data-testid="input-filter-date-to"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange("category", value)}
                >
                  <SelectTrigger data-testid="select-filter-category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold" data-testid="text-total-amount">
                ${stats.total}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Count</p>
              <p className="text-2xl font-bold" data-testid="text-expense-count">
                {stats.count}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-2xl font-bold" data-testid="text-average-expense">
                ${stats.average}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No expenses found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or add your first expense.
              </p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <h3 className="font-semibold" data-testid={`text-vendor-${expense.id}`}>
                        {expense.vendor}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid={`text-date-${expense.id}`}>
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" data-testid={`text-amount-${expense.id}`}>
                      ${expense.total}
                    </p>
                    <Badge className={getCategoryColor(expense.category)}>
                      {CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="mb-3" />
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground" data-testid={`text-item-count-${expense.id}`}>
                    {expense.items.length} item{expense.items.length !== 1 ? 's' : ''}
                  </p>
                  <Button variant="ghost" size="sm" data-testid={`button-view-details-${expense.id}`}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
