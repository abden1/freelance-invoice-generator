"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSkeletonProps {
  variant?: "table" | "cards" | "form";
  rows?: number;
  columns?: number;
  className?: string;
}

function TableSkeleton({
  rows = 5,
  columns = 5,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {/* Table header */}
      <div className="flex items-center gap-4 border-b pb-3 mb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-4", i === 0 ? "w-1/4" : "flex-1")}
          />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b py-3 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                "h-4",
                colIndex === 0 ? "w-1/4" : "flex-1",
                colIndex === columns - 1 ? "w-16" : ""
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CardsSkeleton({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FormSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Form title */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Form fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      {/* Textarea */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full" />
      </div>
      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function LoadingSkeleton({
  variant = "table",
  rows,
  columns,
  className,
}: LoadingSkeletonProps) {
  if (variant === "cards") {
    return <CardsSkeleton rows={rows} className={className} />;
  }

  if (variant === "form") {
    return <FormSkeleton className={className} />;
  }

  return <TableSkeleton rows={rows} columns={columns} className={className} />;
}
