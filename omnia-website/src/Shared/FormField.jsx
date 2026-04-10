import React from "react";
import { Label } from "@/components/ui/label";

export const FormField = ({
  label,
  name,
  register,
  icon: Icon,
  error,
  htmlFor,
  type = "text",
  placeholder,
  rules,
  className = "",
  inputProps = {},
}) => {
  const registration = register && name ? register(name, rules) : {};

  return (
    <div className="w-full space-y-2">
      {label ? (
        <Label htmlFor={htmlFor || name} className="block text-sm font-semibold text-on-surface">
          {label}
        </Label>
      ) : null}

      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/70" />
        ) : null}

        <input
          id={htmlFor || name}
          type={type}
          placeholder={placeholder || label}
          className={`precision-input ${Icon ? "pl-12" : ""} ${error ? "!shadow-[inset_0_0_0_2px_rgba(179,27,37,0.85)]" : ""} ${className}`}
          {...registration}
          {...inputProps}
        />
      </div>

      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
    </div>
  );
};
