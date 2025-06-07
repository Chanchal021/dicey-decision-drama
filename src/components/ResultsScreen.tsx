import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Screen, User, Room } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ErrorDisplay from "./results/ErrorDisplay";
import VotingResults from "./results/VotingResults";
import WinnerDisplay from "./results/WinnerDisplay";
import TiebreakerSelector from "./results/TiebreakerSelector";
import TiebreakerAnimationScreen from "./results/TiebreakerAnimationScreen";
import TiebreakerResult from "./results/TiebreakerResult";

interface ResultsScreenProps {
  room: Room | null;
  user: User | null;
  onComplete: (room: Room) => void;
  onNavigate: (screen: Screen) => void;
}

const ResultsScreen = ({ room, user, onComplete, onNavigate }: ResultsScreenProps) => {
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

  if (!room || !user) return null;

  // Defensive checks for room data
  if (!room.options || room.options.length === 0) {
    return <ErrorDisplay type="no-options" onNavigate={onNavigate} />;
  }

  const sortedResults = Object.entries(voteResults).sort(([,a], [,b]) => b - a);
  
  // Additional safety checks
  if (sortedResults.length === 0) {
    return <ErrorDisplay type="processing" onNavigate={onNavigate} />;
  }

  const maxVotes = Math.max(...Object.values(voteResults));
  const winners = sortedResults.filter(([,votes]) => votes === maxVotes);
  const hasTie = winners.length > 1;
  const totalVotes = Object.values(voteResults).reduce((sum, votes) => sum + votes, 0);

  const handleTiebreaker = async (method: "dice" | "spinner" | "coin") => {
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

  if (showTiebreaker && isAnimating) {
    return (
      <TiebreakerAnimationScreen 
        method={room.tiebreaker_used as "dice" | "spinner" | "coin"} 
      />
    );
  }

  if (tiebreakerResult) {
    return (
      <TiebreakerResult 
        winner={tiebreakerResult}
        method={room.tiebreaker_used || ''}
        onNavigate={handleTiebreakerExit}
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 mb-6">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <CardTitle className="text-3xl font-bold text-purple-600 mb-2">
              Voting Results
            </CardTitle>
            <p className="text-xl text-gray-600">{room.title}</p>
          </CardHeader>
        </Card>

        {/* Results */}
        <VotingResults 
          sortedResults={sortedResults}
          totalVotes={totalVotes}
          maxVotes={maxVotes}
        />

        {/* Winner or Tiebreaker */}
        {!hasTie && winners.length > 0 ? (
          <WinnerDisplay 
            winner={winners[0][0]}
            onFinish={handleFinish}
            onNavigate={onNavigate}
          />
        ) : hasTie && winners.length > 0 ? (
          <TiebreakerSelector 
            winnersCount={winners.length}
            maxVotes={maxVotes}
            onTiebreaker={handleTiebreaker}
          />
        ) : (
          <ErrorDisplay type="no-results" onNavigate={onNavigate} />
        )}
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
