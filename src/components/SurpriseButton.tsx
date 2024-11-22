import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "@/lib/supabase-client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { SurpriseAnimation } from "./SurpriseAnimation";

export const SurpriseButton = () => {
  const { toast } = useToast();
  const [showAnimation, setShowAnimation] = useState(false);
  
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => fetchEvents(),
  });

  const handleSurprise = () => {
    if (events.length === 0) {
      toast({
        title: "No events available",
        description: "Sorry, there are no events to choose from at the moment.",
        variant: "destructive",
      });
      return;
    }

    setShowAnimation(true);
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    window.open(randomEvent.link, '_blank');
    
    toast({
      title: "Opening event page",
      description: `Taking you to ${randomEvent.title}!`,
    });
  };

  return (
    <>
      <Button
        onClick={handleSurprise}
        variant="outline"
        className="bg-white/10 border-white/10 text-white hover:bg-white hover:text-black transition-colors"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Surprise Me
      </Button>
      <SurpriseAnimation 
        isOpen={showAnimation}
        onAnimationComplete={handleAnimationComplete}
      />
    </>
  );
};