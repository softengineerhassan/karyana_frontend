import React, { useState, useEffect, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Input } from "./input";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import useFetchData from "@/hooks/useFetchData";

export const DropdownField = ({
  control,
  name,
  label,
  endpoint,
  rules,
  labelKey = "name_en" || "name",
  valueKey = "id",
  maxVisible = 10,
  showSearch = true,
  defaultParams = { page: 1, per_page: 10 },
  dynamicParams = {},
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [search, setSearch] = useState("");
  const { data, loading, executeFetch } = useFetchData();
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
        const items =
          res?.data?.items ||
          res?.data ||
          res?.items ||
          res?.data?.data ||
          res?.data?.roles ||
          [];
        const itemsMain = items?.roles ? items?.roles : items;
        setOptions(Array.isArray(itemsMain) ? itemsMain : []);
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
                  t("selectOption", { field: label })}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className={cn("w-[250px]", isRTL ? "text-right" : "text-left")}
            >
              {showSearch && (
                <>
                  <div className="relative p-2">
                    <MagnifyingGlassIcon
                      className={cn(
                        "absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary",
                        isRTL ? "right-3" : "left-3"
                      )}
                    />
                    <Input
                      dir={isRTL ? "rtl" : "ltr"}
                      placeholder={t("search")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={cn(
                        "h-10 text-sm text-secondary-foreground w-full",
                        isRTL ? "pr-8 text-right" : "pl-8 text-left"
                      )}
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
                    {t("noOptions")}
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
            <p className="text-red-500 text-xs">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
};
