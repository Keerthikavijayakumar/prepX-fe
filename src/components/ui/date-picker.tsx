"use client"

import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  monthYearOnly?: boolean
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", monthYearOnly = false }: DatePickerProps) {
  // Safely parse the date value
  const parseDate = React.useCallback((dateStr?: string): Date | undefined => {
    if (!dateStr) return undefined;
    
    try {
      // Try to parse different formats
      if (monthYearOnly) {
        // Try to parse "MMM yyyy" format (e.g., "Jan 2020")
        const parsedDate = parse(dateStr, "MMM yyyy", new Date());
        if (isValid(parsedDate)) return parsedDate;
        
        // Try to parse "MM/yyyy" format
        const parsedDate2 = parse(dateStr, "MM/yyyy", new Date());
        if (isValid(parsedDate2)) return parsedDate2;
      }
      
      // Try standard date format
      const date = new Date(dateStr);
      return isValid(date) ? date : undefined;
    } catch (e) {
      console.error("Error parsing date:", e);
      return undefined;
    }
  }, [monthYearOnly]);

  const [date, setDate] = React.useState<Date | undefined>(parseDate(value));

  // Update date when value changes
  React.useEffect(() => {
    setDate(parseDate(value));
  }, [value, parseDate]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate && isValid(selectedDate)) {
      if (monthYearOnly) {
        onChange(format(selectedDate, "MM/yyyy"));
      } else {
        onChange(format(selectedDate, "yyyy-MM-dd"));
      }
    } else {
      onChange("");
    }
  };

  const formatDisplayDate = (date: Date | undefined): React.ReactNode => {
    if (!date || !isValid(date)) return <span>{placeholder}</span>;
    
    try {
      return monthYearOnly ? format(date, "MMM yyyy") : format(date, "PPP");
    } catch (e) {
      console.error("Error formatting date:", e);
      return <span>{placeholder}</span>;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayDate(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
