import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { MagnifyingGlassIcon, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import useFetchData from "@/hooks/useFetchData";

export const MultiSelectDropdown = ({
  control,
  name,
  label,
  endpoint,
  rules,
  labelKey = "title",
  valueKey = "id",
  maxVisible = 10,
  showSearch = true,
  defaultParams = { page: 1, per_page: 10 },
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [search, setSearch] = useState("");
  const { data, loading, executeFetch } = useFetchData();
  const [options, setOptions] = useState([]);

  // Fetch options
  useEffect(() => {
    if (!endpoint) return;

    const delay = setTimeout(async () => {
      try {
        const params = new URLSearchParams(defaultParams);
        if (search) params.set("search", search);
        const res = await executeFetch(
          "GET",
          `${endpoint}?${params.toString()}`
        );
        const items = res?.data?.items || res?.data || res?.items || [];
        setOptions(items);
      } catch (err) {
        console.error("MultiSelect fetch error:", err);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [search, endpoint]);

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
      key={options.length}
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => {
        const selectedValues = field.value || [];

        const toggleSelection = (id) => {
          const isSelected = selectedValues.includes(id);
          const newValues = isSelected
            ? selectedValues.filter((v) => v !== id)
            : [...selectedValues, id];
          field.onChange(newValues);
        };

        const selectedLabels = options
          .filter((o) => selectedValues.includes(o[valueKey]))
          .map((o) => o[labelKey])
          .join(", ");

        return (
          <div className="space-y-2 relative">
            {label && <Label htmlFor={name}>{label}</Label>}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between truncate"
                >
                  {selectedValues.length > 0
                    ? selectedLabels
                    : t("selectOption", { field: label })}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className={cn(
                  "w-[260px] max-h-72 overflow-y-auto",
                  isRTL ? "text-right" : "text-left"
                )}
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
                  filteredOptions.map((o) => {
                    const selected = selectedValues.includes(o[valueKey]);

                    return (
                      <DropdownMenuItem
                        key={o[valueKey]}
                        onSelect={() => toggleSelection(o[valueKey])}
                        className="flex items-center w-full"
                      >
                        {isRTL ? (
                          <div className="flex items-center  gap-2">
                            <span>{o[labelKey]}</span>

                            <div className="flex items-center gap-2">
                              {selected && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                              <input
                                type="checkbox"
                                checked={selected}
                                readOnly
                                className="accent-primary"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selected}
                                readOnly
                                className="accent-primary"
                              />
                              {selected && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </div>

                            <span>{o[labelKey]}</span>
                          </div>
                        )}
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {fieldState.error && (
              <p className="text-red-500 text-sm">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
};
