import React from "react";
import AppButton from "./AppButton";
import { Plus, Filter } from "lucide-react";
import SearchBar from "./SearchBar";
import { useTranslation } from "react-i18next";

export default function PageHeader({
  title,
  subtitle,
  actionButton,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
  onCreate,
  createLabel,
  createIcon = Plus,
  onFilter,
  filterIcon = Filter,
}) {
  const { t } = useTranslation();
  
  // Use translated defaults if not provided
  const finalSearchPlaceholder = searchPlaceholder || t("shared.page_header.search_placeholder");
  const finalCreateLabel = createLabel || t("shared.page_header.create");
  
  return (
    <div className="space-y-2 mb-2">
      {(title || subtitle) && (
        <div>
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 max-w-md">
          {searchValue !== undefined && (
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder={finalSearchPlaceholder}
            />
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {children}

          {actionButton && actionButton}

          {onFilter && (
            <AppButton
              label={t("shared.page_header.filter")}
              variant="outline"
              leftIcon={filterIcon}
              onClick={onFilter}
            />
          )}

          {onCreate && (
            <AppButton
              label={finalCreateLabel}
              leftIcon={createIcon}
              onClick={onCreate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
