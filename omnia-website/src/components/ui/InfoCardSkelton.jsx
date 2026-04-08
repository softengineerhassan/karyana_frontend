import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InfoCardSkelton() {
  return (
    <React.Fragment>
      <Card className="p-4">
        <CardContent className="p-0 flex flex-row gap-6">
          {/* Left side image skeleton */}
          <div className="relative max-w-80 w-full h-[280px] rounded-md overflow-hidden">
            <Skeleton className="w-full h-full rounded-md" />
          </div>

          {/* Right side content skeleton */}
          <div className="flex flex-col flex-1 gap-4">
            {/* Title + Description */}
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />

            {/* Details rows */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex flex-row gap-4 items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>

              <div className="flex flex-row gap-4 items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>

              <div className="flex flex-row gap-4 items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </React.Fragment>
  );
}
