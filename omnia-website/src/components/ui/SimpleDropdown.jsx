import { useState, useMemo } from "react";
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
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
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

              {filteredOptions.length === 0 ? (
                <DropdownMenuItem disabled>
                  <div className="text-sm text-muted-foreground">
                    {t("noOptions")}
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
