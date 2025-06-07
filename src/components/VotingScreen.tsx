
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Screen, User, Room } from "@/types";
import { Check, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoomRealtime } from "@/hooks/useRoomRealtime";

interface VotingScreenProps {
  room: Room | null;
  user: User | null;
  onVoteSubmitted: (room: Room) => void;
  onNavigate: (screen: Screen) => void;
}

const VotingScreen = ({ room, user, onVoteSubmitted, onNavigate }: VotingScreenProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(room);
  const { toast } = useToast();

  // Set up real-time updates for this room
  useRoomRealtime({
    roomId: room?.id || null,
    onRoomUpdate: (updatedRoom) => {
      setCurrentRoom(updatedRoom);
      
      // Check if all votes are in and trigger results
      const totalVotes = updatedRoom.votes?.length || 0;
      const totalParticipants = updatedRoom.room_participants?.length || 0;
      
      if (totalVotes >= totalParticipants && totalParticipants > 0) {
        console.log('All votes collected, transitioning to results');
        setTimeout(() => {
          onVoteSubmitted(updatedRoom);
        }, 1500);
      }
    }
  });

  const workingRoom = currentRoom || room;

  // Early returns for error states
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access this room.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workingRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">Room Not Found</h2>
            <p className="text-gray-600">Unable to load room information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has already voted
  useEffect(() => {
    const userHasVoted = workingRoom.votes?.some(vote => vote.user_id === user.id) || false;
    setHasVoted(userHasVoted);
  }, [workingRoom.votes, user.id]);

  const totalVotes = workingRoom.votes?.length || 0;
  const totalParticipants = workingRoom.room_participants?.length || 0;
  const options = workingRoom.options || [];
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5);

  const handleVote = (optionId: string) => {
    if (hasVoted || isSubmitting) return;
    setSelectedOption(optionId);
  };

  const handleSubmitVote = async () => {
    if (!selectedOption || hasVoted || isSubmitting || !user) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          room_id: workingRoom.id,
          user_id: user.id,
          option_id: selectedOption
        });

      if (error) {
        console.error('Vote submission error:', error);
        toast({
          title: "Failed to submit vote",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setHasVoted(true);
      
      const selectedOptionText = options.find(opt => opt.id === selectedOption)?.text || 'Unknown option';
      
      toast({
        title: "Vote submitted! 🗳️",
        description: `You voted for: ${selectedOptionText}`,
      });

    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Failed to submit vote",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-4"
              >
                🗳️
              </motion.div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                Vote Submitted!
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Waiting for other participants...
              </p>
              <p className="text-gray-500">
                {totalVotes} / {totalParticipants} votes received
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
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
            <div className="text-4xl mb-2">🗳️</div>
            <CardTitle className="text-3xl font-bold text-purple-600 mb-2">
              Time to Vote!
            </CardTitle>
            <p className="text-xl text-gray-600 mb-4">{workingRoom.title}</p>
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                {totalVotes} / {totalParticipants} voted
              </Badge>
              <Badge variant="outline" className="text-lg px-3 py-1">
                <Clock className="w-4 h-4 mr-1" />
                Anonymous Voting
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Voting Options */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          {shuffledOptions.map((option, index) => (
            <motion.div
              key={option.id}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
              whileHover={{ 
                scale: 1.05, 
                transition: { duration: 0.2 } 
              }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={() => handleVote(option.id)}
            >
              <Card className={`
                transition-all duration-300 border-2
                ${selectedOption === option.id 
                  ? 'border-purple-500 bg-purple-50/90 shadow-lg' 
                  : 'border-gray-200 bg-white/90 hover:border-purple-300 hover:shadow-lg'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        Option {index + 1}
                      </div>
                      <div className="text-lg text-gray-800">
                        {option.text}
                      </div>
                    </div>
                    {selectedOption === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Submit Vote Button */}
        {selectedOption && !hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Button
              onClick={handleSubmitVote}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl px-8 py-4 rounded-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Vote ✅"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VotingScreen;
