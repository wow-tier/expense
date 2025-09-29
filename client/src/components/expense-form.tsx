import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X, Plus } from "lucide-react";

interface ExpenseFormProps {
  initialData?: Partial<InsertExpense>;
  onSubmit: (data: InsertExpense) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  { value: "groceries", label: "Groceries" },
  { value: "gas", label: "Gas & Transportation" },
  { value: "dining", label: "Dining & Food" },
  { value: "shopping", label: "Shopping" },
  { value: "utilities", label: "Utilities" },
  { value: "other", label: "Other" },
];

export function ExpenseForm({ initialData, onSubmit, onCancel, isSubmitting }: ExpenseFormProps) {
  const [items, setItems] = useState(
    initialData?.items || [{ name: "", quantity: "1", price: "0.00" }]
  );

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      vendor: initialData?.vendor || "",
      total: initialData?.total || "0.00",
      date: initialData?.date || new Date(),
      category: initialData?.category || "other",
      items: initialData?.items || [{ name: "", quantity: "1", price: "0.00" }],
    },
  });

  const calculateTotal = () => {
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      return sum + price;
    }, 0);
    form.setValue("total", total.toFixed(2));
  };

  const addItem = () => {
    const newItems = [...items, { name: "", quantity: "1", price: "0.00" }];
    setItems(newItems);
    form.setValue("items", newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      form.setValue("items", newItems);
      calculateTotal();
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    form.setValue("items", newItems);
    
    if (field === "price") {
      calculateTotal();
    }
  };

  const handleSubmit = (data: InsertExpense) => {
    onSubmit({ ...data, items });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Receipt Preview */}
        {initialData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scanned Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                <span className="text-muted-foreground">Receipt preview</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Information */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Information</CardTitle>
            <p className="text-sm text-muted-foreground">Review and edit before saving</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-vendor" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                        onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                        data-testid="input-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        {...field}
                        data-testid="input-total"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Item Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Items</CardTitle>
                <p className="text-sm text-muted-foreground">Add or edit line items</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                data-testid="button-add-item"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      data-testid={`input-item-name-${index}`}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        data-testid={`input-item-quantity-${index}`}
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          value={item.price}
                          onChange={(e) => updateItem(index, "price", e.target.value)}
                          data-testid={`input-item-price-${index}`}
                        />
                      </div>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      data-testid={`button-remove-item-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span data-testid="text-calculated-total">${form.watch("total")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="button-save-expense"
          >
            {isSubmitting ? "Saving..." : "Save Expense"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
