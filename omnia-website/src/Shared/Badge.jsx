import React from 'react';
import { cn } from "@/lib/utils"; 

export function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'md', 
  className = '' 
}) {
  
  const variants = {
    primary: 'bg-gold-primary/10 text-gold-primary border border-gold-primary/25',
    success: 'bg-luxury-success/10 text-luxury-success border border-luxury-success/25',
    warning: 'bg-luxury-warning/10 text-luxury-warning border border-luxury-warning/25',
    danger: 'bg-gold-danger/10 text-gold-danger border border-gold-danger/25',
    neutral: 'bg-luxury-neutral/10 text-luxury-text-dim border border-luxury-neutral/25',
    featured: 'bg-gold-gradient text-white border-0 shadow-md'
  };
  
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm'
  };
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full tracking-wide font-semibold transition-colors",
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
}