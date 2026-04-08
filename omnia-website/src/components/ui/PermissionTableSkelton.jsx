import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const PermissionTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full   overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 p-3 border-b bg-muted">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16 justify-self-center" />
        <Skeleton className="h-4 w-16 justify-self-center" />
        <Skeleton className="h-4 w-24 justify-self-center" />
        <Skeleton className="h-4 w-16 justify-self-center" />
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-5 gap-4 p-3 border-b last:border-0"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-6 rounded-full justify-self-center" />
          <Skeleton className="h-6 w-6 rounded-full justify-self-center" />
          <Skeleton className="h-6 w-6 rounded-full justify-self-center" />
          <Skeleton className="h-6 w-10 justify-self-center" />
        </div>
      ))}
    </div>
  );
};
