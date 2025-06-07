
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Room, User } from "@/types";

interface UseResultsLogicProps {
  room: Room | null;
  user: User | null;
  onComplete: (room: Room) => void;
}

export const useResultsLogic = ({ room, user, onComplete }: UseResultsLogicProps) => {
  const [showTiebreaker, setShowTiebreaker] = useState(false);
  const [tiebreakerResult, setTiebreakerResult] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [voteResults, setVoteResults] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (!room || !room.options) return;
    
    // Calculate vote results by counting votes per option
    const results = room.options.reduce((acc, option) => {
      const voteCount = (room.votes || []).filter(vote => vote.option_id === option.id).length;
      acc[option.text] = voteCount;
      return acc;
    }, {} as Record<string, number>);
    
    setVoteResults(results);
  }, [room]);

  const handleTiebreaker = async (method: "dice" | "spinner" | "coin") => {
    if (!room || !room.options) return;
    
    const sortedResults = Object.entries(voteResults).sort(([,a], [,b]) => b - a);
    const maxVotes = Math.max(...Object.values(voteResults));
    const winners = sortedResults.filter(([,votes]) => votes === maxVotes);
    
    if (winners.length === 0) {
      toast({
        title: "Error",
        description: "No winners found for tiebreaker",
        variant: "destructive"
      });
      return;
    }

    setIsAnimating(true);
    setShowTiebreaker(true);

    // Simulate tiebreaker animation
    setTimeout(async () => {
      const randomWinner = winners[Math.floor(Math.random() * winners.length)][0];
      setTiebreakerResult(randomWinner);
      
      // Find the winning option ID
      const winningOption = room.options?.find(opt => opt.text === randomWinner);
      
      try {
        const { error } = await supabase
          .from('rooms')
          .update({
            final_option_id: winningOption?.id,
            tiebreaker_used: method,
            resolved_at: new Date().toISOString()
          })
          .eq('id', room.id);

        if (error) {
          console.error('Error updating room:', error);
          toast({
            title: "Error saving result",
            description: error.message,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error updating room:', error);
      }

      // Remove the automatic timeout - let user manually exit
      setIsAnimating(false);
    }, 3000);
  };

  const handleTiebreakerExit = () => {
    if (tiebreakerResult && room) {
      const winningOption = room.options?.find(opt => opt.text === tiebreakerResult);
      const updatedRoom = {
        ...room,
        final_option_id: winningOption?.id,
        tiebreaker_used: room.tiebreaker_used,
        resolved_at: new Date().toISOString()
      };
      onComplete(updatedRoom);
    }
  };

  const handleFinish = async (winner: string) => {
    if (!room) return;
    
    // Find the winning option ID
    const winningOption = room.options?.find(opt => opt.text === winner);
    
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          final_option_id: winningOption?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', room.id);

      if (error) {
        console.error('Error updating room:', error);
        toast({
          title: "Error saving result",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const updatedRoom = {
        ...room,
        final_option_id: winningOption?.id,
        resolved_at: new Date().toISOString()
      };
      onComplete(updatedRoom);
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  return {
    showTiebreaker,
    tiebreakerResult,
    isAnimating,
    voteResults,
    handleTiebreaker,
    handleTiebreakerExit,
    handleFinish
  };
};
