import React, { useState, useMemo, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MagnifyingGlassIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export const FilterDropdown = ({
  label,
  options = [],
  value,
  onChange,
  loading = false,
  showSearch = true,
  labelKey = "name",
  valueKey = "id",
  className,
  onClick,
  onSearch,
}) => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      if (onSearch) onSearch(search);
    }, 500);
    return () => clearTimeout(delay);
  }, [search, onSearch]);

  const filtered = useMemo(() => {
    if (onSearch) return options;
    if (!search) return options.slice(0, 10);
    return options.filter((o) =>
      o[labelKey]?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options, labelKey, onSearch]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 bg-primary/20 text-primary w-full sm:w-auto",
            className
          )}
          onClick={onClick}
        >
          <FunnelSimpleIcon className="h-4 w-4" />
          {value
            ? options.find((o) => o[valueKey] === value)?.[labelKey]
            : label}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[250px] max-h-[300px] overflow-y-auto text-left"
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

        {loading ? (
          <div className="flex flex-col gap-2 p-2">
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="text-sm text-muted-foreground">
              No options found
            </div>
          </DropdownMenuItem>
        ) : (
          filtered.map((opt) => (
            <DropdownMenuItem
              key={opt[valueKey]}
              onClick={() => onChange(opt[valueKey], opt)}
              className={cn(
                opt[valueKey] === value ? "bg-primary/10 text-primary" : ""
              )}
            >
              {opt[labelKey]}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};