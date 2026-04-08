import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SearchBar({
  value,
  onChange,
  placeholder,
  className,
}) {
  const { t } = useTranslation();
  const finalPlaceholder = placeholder || t("shared.search_bar.placeholder");
  
  return (
    <div className={`relative w-full  ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2.5" />

      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={finalPlaceholder}
        className="pl-9 pr-9 rtl:pl-9 rtl:pr-9"
      />
      {value && (
        <button
          onClick={() => onChange("")} 
          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground rtl:right-auto rtl:left-2.5"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
