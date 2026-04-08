import React from "react";
import { cn } from "@/lib/utils"; 

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  onClick,
}) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-luxury-card rounded-3xl border border-luxury-border shadow-md",
        "transition-all duration-500 ease-in-out",
        paddingStyles[padding],
        hover &&
          "hover:border-gold-primary/30 hover:shadow-lg hover:-translate-y-1 cursor-pointer",

        className
      )}
    >
      {children}
    </div>
  );
}
