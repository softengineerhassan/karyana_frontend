import React from "react";
import { Card, CardContent } from "./card";
import { Skeleton } from "./skeleton";

export const SmallCardSkeltion = () => {
  return (
    <Card className="w-full p-2">
      <CardContent className="p-0 flex flex-row gap-3 items-center relative">
        <Skeleton className="w-16 h-16 rounded-md" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col items-start gap-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-50" />
          </div>
          <Skeleton className="h-5 w-30 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};