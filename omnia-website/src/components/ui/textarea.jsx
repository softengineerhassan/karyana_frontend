import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

function Textarea({
  className,
  label,
  error,
  htmlFor,
  name,
  register,
  rules,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={htmlFor || name} className="mb-2">
          {label}
        </Label>
      )}
      <textarea
        id={htmlFor || name}
        name={name}
        rows={3}
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...(register && name ? register(name, rules) : {})}
        {...props}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

export { Textarea };
