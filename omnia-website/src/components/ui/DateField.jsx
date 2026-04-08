import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

const DateField = ({
  field,
  watch,
  setValue,
  startDate,
  errors,
  timeValue,
  setTimeValue,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const value = watch(field);

  const isStart = field === "start_date";
  const labelText = isStart ? t("startDate") : t("endDate");
  const placeholder = isStart ? t("selectStartDate") : t("selectEndDate");

  const formatted = value ? format(value, "PPP") : placeholder;

  // ✅ Disable logic fix
  const disabledFn = useCallback(
    (date) => {
      const normalize = (d) => new Date(d.setHours(0, 0, 0, 0));
      const today = normalize(new Date());
      const cand = normalize(date);

      if (isStart) {
        // Start date can't be before today
        return cand < today;
      } else {
        // End date can't be before today or before start date
        if (!startDate) return cand < today;
        return cand < normalize(startDate);
      }
    },
    [isStart, startDate]
  );

  const handleSelect = (d) => {
    if (!d) return;
    setValue(field, d, { shouldDirty: true, shouldValidate: true });
    setOpen(false);

    // ✅ If selecting start date greater than current end date, reset end date
    if (isStart && watch("end_date") && watch("end_date") < d) {
      setValue("end_date", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-primary-foreground">{labelText}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatted}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={disabledFn}
            initialFocus
          />
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            className="mt-2"
          />
        </PopoverContent>
      </Popover>
      {errors[field] && (
        <p className="text-red-500 text-sm">{errors[field].message}</p>
      )}
    </div>
  );
};

export default React.memo(DateField);
