import { useState, useEffect } from "react";
import { SpotifyLogin } from "@/components/SpotifyLogin";
import { ConcertCard } from "@/components/ConcertCard";
import { SurpriseButton } from "@/components/SurpriseButton";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { fetchEvents, Event } from "@/lib/supabase-client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [venueFilter, setVenueFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<"date" | "title" | "venue">("date");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['events', sortOrder, sortBy],
    queryFn: () => fetchEvents(sortOrder)
  });

  const handleTestLogin = () => {
    setIsAuthenticated(true);
    toast({
      title: "Test Mode Activated",
      description: "You're now viewing the interface as a logged-in user",
    });
  };

  const clearFilters = () => {
    setVenueFilter("");
    setDateRange({ from: undefined, to: undefined });
    setSortOrder("asc");
    setSortBy("date");
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset to default values",
    });
  };

  const hasActiveFilters = venueFilter || dateRange.from || dateRange.to || sortOrder !== "asc" || sortBy !== "date";

  const filteredEvents = events.filter((event: Event) => {
    let matchesVenue = true;
    let matchesDateRange = true;

    if (venueFilter) {
      matchesVenue = event.venue.toLowerCase().includes(venueFilter.toLowerCase());
    }

    if (dateRange.from && dateRange.to) {
      const eventDate = parseISO(event.date);
      matchesDateRange = isWithinInterval(eventDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    }

    return matchesVenue && matchesDateRange;
  }).sort((a: Event, b: Event) => {
    if (sortBy === "title") {
      return sortOrder === "asc" 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (sortBy === "venue") {
      return sortOrder === "asc"
        ? a.venue.localeCompare(b.venue)
        : b.venue.localeCompare(a.venue);
    }
    // Default sort by date
    return sortOrder === "asc"
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      new YT.Player('video-background', {
        videoId: 'q4xKvHANqjk',
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          mute: 1,
          playlist: 'q4xKvHANqjk',
          start: 40
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          }
        }
      });
    };
  }, []);

  if (error) {
    toast({
      title: "Error loading events",
      description: "Could not load events from the database",
      variant: "destructive",
    });
  }

  return (
    <div className="relative min-h-screen">
      <div className="container relative z-20 py-8 mx-auto text-center flex flex-col min-h-screen">
        <h1 className="text-4xl font-bold text-white mb-8 animate-fade-in flex-grow-0">
          Discover Your Next Concert
        </h1>
        
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
          {!isAuthenticated ? (
            <div className="space-y-4">
              <SpotifyLogin />
              <div className="mt-4">
                <Button 
                  variant="secondary"
                  onClick={handleTestLogin}
                  className="text-sm"
                >
                  View Demo Interface
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full max-w-6xl mx-auto space-y-6">
                <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
                  <Input
                    placeholder="Filter by venue..."
                    value={venueFilter}
                    onChange={(e) => setVenueFilter(e.target.value)}
                    className="max-w-[200px] bg-white/10 border-white/10 text-white placeholder:text-white/50"
                  />
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "bg-white/10 border-white/10 text-white hover:bg-white/20",
                          dateRange.from && "text-white"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
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
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white/10 border-white/10 text-white hover:bg-white/20">
                        <Filter className="w-4 h-4 mr-2" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => { setSortBy("date"); setSortOrder("asc"); }}>
                        Date (Earliest First)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy("date"); setSortOrder("desc"); }}>
                        Date (Latest First)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setSortBy("title"); setSortOrder("asc"); }}>
                        Artist Name (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy("title"); setSortOrder("desc"); }}>
                        Artist Name (Z-A)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setSortBy("venue"); setSortOrder("asc"); }}>
                        Venue Name (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy("venue"); setSortOrder("desc"); }}>
                        Venue Name (Z-A)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="bg-white/10 border-white/10 text-white hover:bg-white/20"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}

                  <SurpriseButton />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
                {isLoading ? (
                  <p className="text-white">Loading events...</p>
                ) : (
                  filteredEvents.map((event: Event, index: number) => (
                    <div key={index} className="flex justify-center">
                      <ConcertCard
                        artist={event.title}
                        date={event.date}
                        venue={event.venue}
                        location={event.location || ""}
                        imageUrl={event.image}
                        ticketUrl={event.link}
                        minutesListened={0}
                      />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
