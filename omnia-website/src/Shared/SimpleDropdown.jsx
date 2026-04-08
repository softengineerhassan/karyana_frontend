import React, { useState, useMemo } from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./dropdown-menu";
import { Label } from "./label";
import { Controller } from "react-hook-form";
import { Input } from "./input";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

export const SimpleDropdown = ({
  control,
  name,
  label,
  options = [],
  rules,
  labelKey = "label",
  valueKey = "value",
  showSearch = true,
}) => {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt[labelKey]?.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, labelKey]);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          {label && <Label htmlFor={name}>{label}</Label>}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {options.find((o) => o[valueKey] === field.value)?.[labelKey] ||
                  `Select ${label || "Option"}`}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[250px] text-left"
            >
              {showSearch && (
                <>
                  <div className="relative p-2">
                    <MagnifyingGlassIcon
                      className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-primary"
                    />
                    <Input
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-10 text-sm text-secondary-foreground w-full pl-8 text-left"
                    />
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}

              {filteredOptions.length === 0 ? (
                <DropdownMenuItem disabled>
                  <div className="text-sm text-muted-foreground">
                    No options found
                  </div>
                </DropdownMenuItem>
              ) : (
                filteredOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt[valueKey]}
                    onSelect={() => field.onChange(opt[valueKey])}
                  >
                    {opt[labelKey]}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {fieldState.error && (
            <p className="text-red-500 text-sm">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
};