import React, { useState, useEffect, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Controller } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import useFetchData from "@/hooks/useFetchData";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const DropdownField = ({
  control,
  name,
  label,
  endpoint,
  rules,
  labelKey = "name",
  valueKey = "id",
  maxVisible = 10,
  showSearch = true,
  defaultParams = { page: 1, per_page: 10 },
  dynamicParams = {},
}) => {
  const [search, setSearch] = useState("");
  const { loading, executeFetch } = useFetchData();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!endpoint) return;

    const delay = setTimeout(async () => {
      try {
        const params = new URLSearchParams(defaultParams);
        if (search) params.set("search_text", search);

        if (dynamicParams) {
          Object.entries(dynamicParams).forEach(([key, value]) => {
            if (value) params.set(key, value);
          });
        }

        const res = await executeFetch(
          "GET",
          `${endpoint}?${params.toString()}`
        );
        const items = res?.data?.items || res?.data?.categories ||res?.data || res?.items || res?.data?.data || res?.categories || [];
        setOptions(items);
      } catch (err) {
        console.error("Dropdown fetch error:", err);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [
    search,
    endpoint,
    JSON.stringify(defaultParams),
    JSON.stringify(dynamicParams),
  ]);

  const filteredOptions = useMemo(() => {
    if (search && !endpoint) {
      return options.filter((o) =>
        o[labelKey]?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return options.slice(0, maxVisible);
  }, [options, search, endpoint, labelKey, maxVisible]);

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
                  `Select ${label || "option"}`}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[250px] text-left">
              {showSearch && (
                <>
                  <div className="relative p-2">
                    <MagnifyingGlassIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-primary" />
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
              ) : filteredOptions.length === 0 ? (
                <DropdownMenuItem disabled>
                  <div className="text-sm text-muted-foreground">
                    No options found
                  </div>
                </DropdownMenuItem>
              ) : (
                filteredOptions.map((o) => (
                  <DropdownMenuItem
                    key={o[valueKey]}
                    onSelect={() => field.onChange(o[valueKey])}
                  >
                    {o[labelKey]}
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