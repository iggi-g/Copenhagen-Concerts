import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchEvents } from "@/lib/supabase-client";
import { FilterControls } from "@/components/FilterControls";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { VideoBackground } from "@/components/VideoBackground";
import { EventsList } from "@/components/EventsList";
import { ContactButton } from "@/components/ContactButton";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<"date" | "title" | "venue">("date");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [favorites] = useLocalStorage<string[]>("favorites", []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', sortOrder, sortBy],
    queryFn: () => fetchEvents(sortOrder)
  });

  const availableVenues = Array.from(new Set(events.map(event => event.venue))).sort();

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedVenues([]);
    setDateRange(undefined);
    setSortOrder("asc");
    setSortBy("date");
    setShowFavoritesOnly(false);
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset to default values",
    });
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedVenues.length > 0 || dateRange?.from || dateRange?.to || sortOrder !== "asc" || sortBy !== "date" || showFavoritesOnly
  );

  const filteredEvents = events.filter((event) => {
    let matchesSearch = true;
    let matchesVenue = true;
    let matchesDateRange = true;
    let matchesFavorites = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        event.title.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query) ||
        event.date.toLowerCase().includes(query) ||
        (event.location || "").toLowerCase().includes(query);
    }

    if (selectedVenues.length > 0) {
      matchesVenue = selectedVenues.includes(event.venue);
    }

    if (dateRange?.from && dateRange?.to) {
      const eventDate = parseISO(event.date);
      matchesDateRange = isWithinInterval(eventDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    }

    if (showFavoritesOnly) {
      matchesFavorites = favorites.includes(event.title);
    }

    return matchesSearch && matchesVenue && matchesDateRange && matchesFavorites;
  }).sort((a, b) => {
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
    return sortOrder === "asc"
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="relative min-h-screen w-full">
      <VideoBackground />
      <div className={cn("relative z-20 py-8 mx-auto text-center flex flex-col min-h-screen w-full px-4 md:px-8")}>
        <PageHeader 
          filteredEventsCount={filteredEvents.length}
          showFavoritesOnly={showFavoritesOnly}
        />
        
        <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
          <div className="hidden md:block w-full max-w-[1920px] mx-auto">
            <FilterControls
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedVenues={selectedVenues}
              setSelectedVenues={setSelectedVenues}
              availableVenues={availableVenues}
              dateRange={dateRange}
              setDateRange={setDateRange}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              sortBy={sortBy}
              setSortBy={setSortBy}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              showFavoritesOnly={showFavoritesOnly}
              setShowFavoritesOnly={setShowFavoritesOnly}
              filteredEvents={filteredEvents}
            />
          </div>

          <div className="md:hidden w-full space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="relative flex-grow">
                  <FilterControls
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedVenues={selectedVenues}
                    setSelectedVenues={setSelectedVenues}
                    availableVenues={availableVenues}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    hasActiveFilters={hasActiveFilters}
                    clearFilters={clearFilters}
                    showFavoritesOnly={showFavoritesOnly}
                    setShowFavoritesOnly={setShowFavoritesOnly}
                    filteredEvents={filteredEvents}
                    isMobile={true}
                  />
                </div>
              </div>
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full bg-white/10 border-white/10 text-white px-4 py-2 rounded hover:bg-white/20 transition-colors"
              >
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {showMobileFilters && (
                <div className="animate-fade-in">
                  <FilterControls
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedVenues={selectedVenues}
                    setSelectedVenues={setSelectedVenues}
                    availableVenues={availableVenues}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    hasActiveFilters={hasActiveFilters}
                    clearFilters={clearFilters}
                    showFavoritesOnly={showFavoritesOnly}
                    setShowFavoritesOnly={setShowFavoritesOnly}
                    filteredEvents={filteredEvents}
                    showOnlyAdvancedFilters={true}
                  />
                </div>
              )}
            </div>
          </div>

          <EventsList 
            events={filteredEvents} 
            isLoading={isLoading}
            showFavoritesOnly={showFavoritesOnly}
          />
        </div>
      </div>
      <ContactButton />
      {showScrollToTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 right-4 rounded-full bg-white/10 border-white/10 text-orange-500 hover:bg-white/20 z-50"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default Index;