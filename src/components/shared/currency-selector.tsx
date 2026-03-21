"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { CURRENCIES } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onValueChange,
  className,
  placeholder = "Select currency",
  disabled = false,
}: CurrencySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder}>
          {value && (() => {
            const currency = CURRENCIES.find((c) => c.code === value);
            if (!currency) return placeholder;
            return (
              <span className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">
                  {currency.symbol}
                </span>
                <span>{currency.code}</span>
                <span className="hidden sm:inline text-muted-foreground">
                  — {currency.name}
                </span>
              </span>
            );
          })()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <span className="flex items-center gap-2">
              <span className="w-8 font-mono text-muted-foreground">
                {currency.symbol}
              </span>
              <span className="font-medium">{currency.code}</span>
              <span className="text-muted-foreground">— {currency.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
