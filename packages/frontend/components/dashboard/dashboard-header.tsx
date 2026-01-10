"use client";

import { CalendarIcon, Download, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}

export function DashboardHeader({
  dateRange,
  onDateRangeChange,
}: DashboardHeaderProps) {
  const handlePresetChange = (preset: string) => {
    const today = new Date();
    let from: Date;
    let to: Date = new Date(today); // Crea una copia, non un riferimento

    switch (preset) {
      case "today":
        from = new Date(today);
        break;
      case "yesterday":
        from = new Date(today);
        from.setDate(from.getDate() - 1);
        to = new Date(from);
        break;
      case "last7days":
        from = new Date(today);
        from.setDate(from.getDate() - 7);
        break;
      case "last30days":
        from = new Date(today);
        from.setDate(from.getDate() - 30);
        break;
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "lastMonth":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        from = new Date(today);
        from.setDate(from.getDate() - 30);
    }

    onDateRangeChange({ from, to });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Panoramica generale delle performance aziendali
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Period Preset Selector */}
        <Select defaultValue="last30days" onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleziona periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Oggi</SelectItem>
            <SelectItem value="yesterday">Ieri</SelectItem>
            <SelectItem value="last7days">Ultimi 7 giorni</SelectItem>
            <SelectItem value="last30days">Ultimi 30 giorni</SelectItem>
            <SelectItem value="thisMonth">Questo mese</SelectItem>
            <SelectItem value="lastMonth">Mese scorso</SelectItem>
            <SelectItem value="custom">Personalizzato</SelectItem>
          </SelectContent>
        </Select>

        {/* Custom Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd MMM yyyy", { locale: it })} -{" "}
                    {format(dateRange.to, "dd MMM yyyy", { locale: it })}
                  </>
                ) : (
                  format(dateRange.from, "dd MMM yyyy", { locale: it })
                )
              ) : (
                <span>Seleziona date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={{
                from: dateRange?.from,
                to: dateRange?.to,
              }}
              onSelect={(range: DateRange | undefined) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({ from: range.from, to: range.to });
                }
              }}
              numberOfMonths={2}
              locale={it}
            />
          </PopoverContent>
        </Popover>

        {/* Refresh Button */}
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Export Button */}
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
