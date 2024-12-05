import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface DateRangeSelectorProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  className?: string;
}

export const DateRangeSelector = ({ dateRange, setDateRange, className }: DateRangeSelectorProps) => {
  const today = new Date();
  
  const handleDatePreset = (preset: 'today' | 'week' | 'nextWeek' | 'month') => {
    const from = new Date();
    let to = new Date();
    
    switch (preset) {
      case 'today':
        to = from;
        break;
      case 'week':
        to.setDate(from.getDate() + 7);
        break;
      case 'nextWeek':
        from.setDate(from.getDate() + 7);
        to.setDate(from.getDate() + 7);
        break;
      case 'month':
        to.setMonth(from.getMonth() + 1);
        break;
    }
    
    setDateRange({ from, to });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "bg-white/10 border-white/10 text-white hover:bg-white/20",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-black/90 border-white/10" 
        align="start"
      >
        <div className="p-2 border-b border-white/10 flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => handleDatePreset('today')} className="bg-white/10 border-white/10 text-white hover:bg-white/20">Today</Button>
          <Button size="sm" variant="outline" onClick={() => handleDatePreset('week')} className="bg-white/10 border-white/10 text-white hover:bg-white/20">This Week</Button>
          <Button size="sm" variant="outline" onClick={() => handleDatePreset('nextWeek')} className="bg-white/10 border-white/10 text-white hover:bg-white/20">Next Week</Button>
          <Button size="sm" variant="outline" onClick={() => handleDatePreset('month')} className="bg-white/10 border-white/10 text-white hover:bg-white/20">This Month</Button>
        </div>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={today}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          fromDate={today}
          className="text-white"
        />
      </PopoverContent>
    </Popover>
  );
};