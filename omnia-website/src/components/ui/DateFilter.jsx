"use client";

import * as React from "react";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DateFilter({ value, onChange }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
   const normalizeDate = (date) =>
    date && !isNaN(new Date(date)) ? new Date(date) : new Date();

  const [range, setRange] = React.useState({
    from: normalizeDate(value?.start_date),
    to: normalizeDate(value?.end_date),
  });

  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);

 const updateRange = (newRange) => {
  if (!newRange?.from || !newRange?.to) {
    setRange(newRange);
    return;
  }

  setRange(newRange);
  onChange?.({
    start_date: format(newRange.from, "yyyy-MM-dd"),
    end_date: format(newRange.to, "yyyy-MM-dd"),
  });
};

  const handlePrev = () => {
    const diff = (range.to - range.from) / (1000 * 60 * 60 * 24) || 0;
    const newFrom = addDays(range.from, -(diff + 1));
    const newTo = addDays(range.to, -(diff + 1));
    updateRange({ from: newFrom, to: newTo });
  };

  const handleNext = () => {
    const diff = (range.to - range.from) / (1000 * 60 * 60 * 24) || 0;
    const newFrom = addDays(range.from, diff + 1);
    const newTo = addDays(range.to, diff + 1);
    updateRange({ from: newFrom, to: newTo });
  };

  const formattedFrom = range?.from
    ? format(range.from, "MM-dd-yyyy")
    : "Start Date";
  const formattedTo = range?.to ? format(range.to, "MM-dd-yyyy") : "End Date";

  return (
    <div  dir={isRTL ? "rtl" : "ltr"} className="flex flex-col gap-1">
      <div
        className={cn(
    "flex flex-wrap items-center justify-between gap-2 rounded-md border w-full",
    isRTL && "flex-row-reverse"
  )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-accent h-8 w-8 text-gray-500"
          onClick={handlePrev}
        >
          {isRTL ? (
            <ChevronLeftIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </Button>

        <Popover open={openStart} onOpenChange={setOpenStart}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex items-center gap-2 text-sm font-medium px-2 hover:bg-transparent"
              )}
            >
              <CalendarIcon className="h-4 w-4 text-pink-500" />
              {formattedFrom}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 !m-0 !w-auto border-none" align={isRTL ? "end" : "start"}>
            <Calendar
              mode="single"
              selected={range.from}
              onSelect={(date) => updateRange({ ...range, from: date })}
            />
          </PopoverContent>
        </Popover>

        <span className="text-gray-400"> - </span>

        <Popover open={openEnd} onOpenChange={setOpenEnd}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex items-center gap-2 text-sm font-medium px-2 hover:bg-transparent"
              )}
            >
              <CalendarIcon className="h-4 w-4 text-pink-500" />
              {formattedTo}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 !m-0 !w-auto border-none" align={isRTL ? "end" : "start"}>
            <Calendar
              mode="single"
              selected={range.to}
              onSelect={(date) => updateRange({ ...range, to: date })}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-accent h-8 w-8 text-gray-500"
          onClick={handleNext}
        >
          {isRTL ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
