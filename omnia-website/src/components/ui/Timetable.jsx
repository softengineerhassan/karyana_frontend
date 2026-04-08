import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function TimetableField({ value = [], onChange }) {
  const handleAdd = useCallback(() => {
    const newSlot = {
      day_of_week: "monday",
      open_time: "09:00:00",
      close_time: "18:00:00",
      is_closed: false,
    };
    onChange([...(value || []), newSlot]);
  }, [value, onChange]);

  const handleRemove = useCallback(
    (index) => {
      const newValue = value.filter((_, i) => i !== index);
      onChange(newValue);
    },
    [value, onChange]
  );

  const handleChange = useCallback(
    (index, field, fieldValue) => {
      const newValue = value.map((slot, i) =>
        i === index ? { ...slot, [field]: fieldValue } : slot
      );
      onChange(newValue);
    },
    [value, onChange]
  );

  return (
    <div className="space-y-3 border rounded-md p-3">
      {value.map((slot, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center border-b pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0 overflow-x-hidden"
        >
          {/* Day Select */}
          <div className="w-full">
            <Select
              value={slot?.day_of_week}
              onValueChange={(val) => handleChange(index, "day_of_week", val)}
            >
              <SelectTrigger className="w-full text-sm text-primary-foreground">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem
                    key={day}
                    value={day}
                    className="text-primary-foreground data-[state=checked]:text-primary-foreground dark:data-[state=checked]:text-white data-[state=checked]:bg-primary/10 rounded"
                  >
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Open Time */}
          <div className="w-full">
            <Input
              type="time"
              value={slot.open_time || ""}
              disabled={slot.is_closed}
              className="w-full px-3 py-2 text-sm"
              onChange={(e) => handleChange(index, "open_time", e.target.value)}
            />
          </div>

          {/* Close Time */}
          <div className="w-full">
            <Input
              type="time"
              value={slot.close_time || ""}
              disabled={slot.is_closed}
              className="w-full px-3 py-2 text-sm "
              onChange={(e) =>
                handleChange(index, "close_time", e.target.value)
              }
            />
          </div>

          {/* Closed Checkbox */}
          <div className="w-full sm:w-auto">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!slot.is_closed}
                onChange={(e) =>
                  handleChange(index, "is_closed", !!e.target.checked)
                }
                className="h-4 w-4"
              />
              <span className="text-sm">Closed</span>
            </label>
          </div>

          {/* Remove Button */}
          <div className="w-full sm:w-auto">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => handleRemove(index)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAdd}
      >
        + Add Timetable Slot
      </Button>
    </div>
  );
}
