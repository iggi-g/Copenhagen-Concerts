import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VenueCheckboxFilterProps {
  venues: string[];
  selectedVenues: string[];
  onVenueChange: (venues: string[]) => void;
  className?: string;
}

export const VenueCheckboxFilter = ({
  venues,
  selectedVenues,
  onVenueChange,
  className,
}: VenueCheckboxFilterProps) => {
  const handleVenueToggle = (venue: string) => {
    if (selectedVenues.includes(venue)) {
      onVenueChange(selectedVenues.filter((v) => v !== venue));
    } else {
      onVenueChange([...selectedVenues, venue]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("bg-white/10 border-white/10 text-white hover:bg-white/20", className)}
        >
          {selectedVenues.length === 0 ? (
            "Select Venues"
          ) : (
            `${selectedVenues.length} venue${selectedVenues.length === 1 ? "" : "s"} selected`
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-screen h-screen md:w-[280px] md:h-auto p-0 bg-black/90 border-white/10 fixed inset-0 md:relative md:rounded-xl" 
        align="start"
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10 sticky top-0 bg-black/90 z-10">
          <h3 className="text-lg font-semibold text-white">Select Venues</h3>
          <PopoverClose className="text-white hover:bg-white/10 rounded-full p-2">
            <X className="h-5 w-5" />
          </PopoverClose>
        </div>
        <div className="grid gap-2 p-4 h-[calc(100vh-64px)] md:h-auto md:max-h-[60vh] overflow-y-auto">
          {venues.map((venue) => (
            <div key={venue} className="flex items-center space-x-2">
              <Checkbox
                id={venue}
                checked={selectedVenues.includes(venue)}
                onCheckedChange={() => handleVenueToggle(venue)}
                className="border-white/50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label
                htmlFor={venue}
                className="text-sm font-medium leading-none text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {venue}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};