"use client";

import { useState, useCallback, useMemo } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { calculateInvoiceTotals } from "@/lib/utils";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export interface UseInvoiceBuilderOptions {
  initialItems?: LineItem[];
  initialTaxRate?: number;
  initialDiscountType?: "PERCENT" | "FIXED" | null;
  initialDiscountValue?: number;
}

let idCounter = 0;

function generateId() {
  return `item-${Date.now()}-${++idCounter}`;
}

export function useInvoiceBuilder(options: UseInvoiceBuilderOptions = {}) {
  const {
    initialItems = [],
    initialTaxRate = 0,
    initialDiscountType = null,
    initialDiscountValue = 0,
  } = options;

  const [items, setItems] = useState<LineItem[]>(
    initialItems.length > 0
      ? initialItems
      : [{ id: generateId(), description: "", quantity: 1, rate: 0 }]
  );
  const [taxRate, setTaxRate] = useState(initialTaxRate);
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED" | null>(
    initialDiscountType
  );
  const [discountValue, setDiscountValue] = useState(initialDiscountValue);

  const totals: InvoiceTotals = useMemo(
    () => calculateInvoiceTotals(items, taxRate, discountType, discountValue),
    [items, taxRate, discountType, discountValue]
  );

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { id: generateId(), description: "", quantity: 1, rate: 0 },
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const updateItem = useCallback(
    (id: string, field: keyof Omit<LineItem, "id">, value: string | number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]:
                  field === "quantity" || field === "rate"
                    ? typeof value === "string"
                      ? parseFloat(value) || 0
                      : value
                    : value,
              }
            : item
        )
      );
    },
    []
  );

  const reorderItems = useCallback((activeId: string, overId: string) => {
    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === activeId);
      const newIndex = prev.findIndex((item) => item.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const resetItems = useCallback((newItems?: LineItem[]) => {
    setItems(
      newItems && newItems.length > 0
        ? newItems
        : [{ id: generateId(), description: "", quantity: 1, rate: 0 }]
    );
  }, []);

  return {
    items,
    totals,
    taxRate,
    discountType,
    discountValue,
    setTaxRate,
    setDiscountType,
    setDiscountValue,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    resetItems,
  };
}
