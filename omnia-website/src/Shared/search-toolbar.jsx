import React from "react";
import {
  MagnifyingGlassIcon,
  FunnelSimpleIcon,
  PlusSquareIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router";

const SearchToolbar = ({
  // Search Props
  showSearch = true,
  searchTerm,
  setSearchTerm,
  searchPlaceholder = "Search...",
  
  // Filter Props
  showFilters = false,
  filterBy,
  setFilterBy,
  filterOptions = [],
  filterLabel = "Filter By",

  // Create Button Props
  showCreate = false,
  createLabel = "Create",
  onCreateClick, // Function ya path dono handle karega
}) => {
  const navigate = useNavigate();

  const handleCreateAction = () => {
    if (typeof onCreateClick === "string") {
      navigate(onCreateClick);
    } else if (typeof onCreateClick === "function") {
      onCreateClick();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full">
      {/* 1. Search Bar */}
      {showSearch && (
        <div className="relative w-full lg:max-w-xs">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-secondary-foreground w-full pl-10 text-left"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 w-full justify-end">
        {/* 2. Filters Dropdown */}
        {showFilters && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-primary/20 text-primary w-full sm:w-auto justify-center cursor-pointer"
              >
                <FunnelSimpleIcon className="h-4 w-4" />
                {filterLabel}
                {filterBy !== "All" && filterBy && `: ${filterBy}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setFilterBy(option.value)}
                  className="cursor-pointer"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* 3. Create Button */}
        {showCreate && (
          <Button
            className="gap-2 text-white w-full sm:w-auto justify-center cursor-pointer"
            onClick={handleCreateAction}
          >
            <PlusSquareIcon className="h-4 w-4" />
            {createLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchToolbar;