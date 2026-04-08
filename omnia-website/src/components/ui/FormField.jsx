import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const FormField = ({
  label,
  error,
  htmlFor,
  type = "text",
  placeholder,
  register,
  name,
  rules,
  className,
  inputProps = {},
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={htmlFor || name} className="mb-2">
          {label}
        </Label>
      )}
      <Input
        id={htmlFor || name}
        type={type}
        placeholder={placeholder || label}
        className={className}
        {...(register && name ? register(name, rules) : {})}
        {...inputProps}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
