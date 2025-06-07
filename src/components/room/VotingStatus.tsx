
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Room, User, Screen } from "@/types";
import { useEffect, useRef } from "react";

interface VotingStatusProps {
  room: Room;
  user: User;
  onNavigate: (screen: Screen) => void;
}

const VotingStatus = ({ room, user, onNavigate }: VotingStatusProps) => {
  const { toast } = useToast();
  const isCreator = room.creator_id === user.id;
  const roomOptions = room.options || [];
  const hasNavigatedRef = useRef(false);

  // Auto-navigate to voting when voting becomes active
  useEffect(() => {
    if (room.is_voting_active && !isCreator && !hasNavigatedRef.current) {
      console.log('Voting is now active, auto-navigating to voting screen');
      hasNavigatedRef.current = true;
      setTimeout(() => {
        onNavigate("voting");
      }, 1000); // Small delay for better UX
    }
    
    // Reset the flag when voting is no longer active
    if (!room.is_voting_active) {
      hasNavigatedRef.current = false;
    }
  }, [room.is_voting_active, isCreator, onNavigate]);

  const handleStartVoting = async () => {
    if (roomOptions.length < 2) {
      toast({
        title: "Need more options! 🤔",
        description: "Add at least 2 options to start voting",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ is_voting_active: true })
        .eq('id', room.id);

      if (error) {
        toast({
          title: "Failed to start voting",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Voting started! 🗳️",
        description: "All participants can now vote",
      });
      
      // Navigate creator to voting screen as well
      onNavigate("voting");
    } catch (error) {
      console.error('Error starting voting:', error);
    }
  };

  if (isCreator && !room.is_voting_active) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <Button
          onClick={handleStartVoting}
          disabled={roomOptions.length < 2}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl px-8 py-4 rounded-full"
        >
          <Play className="w-6 h-6 mr-2" />
          Start Voting! 🗳️
        </Button>
      </motion.div>
    );
  }

  if (room.is_voting_active) {
    return (
      <div className="text-center">
        <Card className="bg-gradient-to-br from-green-100 to-blue-100 border-2 border-green-400 shadow-xl">
          <CardContent className="py-6">
            <div className="text-4xl mb-2">🗳️</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Voting is Active!</h3>
            <p className="text-lg text-gray-600 mb-4">
              {isCreator ? "Participants are voting now..." : "Redirecting to voting..."}
            </p>
            {!isCreator && (
              <Button
                onClick={() => onNavigate("voting")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-6 py-3 rounded-full"
              >
                Vote Now! 🗳️
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="py-6">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-lg text-gray-600">
            Waiting for the room creator to start voting...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VotingStatus;
