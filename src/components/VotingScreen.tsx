
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Screen, User, Room } from "@/types";
import { Check, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VotingScreenProps {
  room: Room | null;
  user: User | null;
  onVoteSubmitted: (room: Room) => void;
  onNavigate: (screen: Screen) => void;
}

const VotingScreen = ({ room, user, onVoteSubmitted, onNavigate }: VotingScreenProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();

  if (!room || !user) return null;

  const userHasVoted = room.votes?.some(vote => vote.id === user.id) || false;
  const totalVotes = room.votes?.length || 0;
  const shuffledOptions = [...room.options].sort(() => Math.random() - 0.5);

  const handleVote = (option: string) => {
    if (userHasVoted || hasVoted) return;
    
    setSelectedOption(option);
  };

  const handleSubmitVote = () => {
    if (!selectedOption || userHasVoted || hasVoted) return;

    const updatedRoom = {
      ...room,
      votes: {
        ...room.votes,
        [user.id]: selectedOption
      }
    };

    setHasVoted(true);
    
    toast({
      title: "Vote submitted! 🗳️",
      description: `You voted for: ${selectedOption}`,
    });

    // Simulate waiting for all votes or end voting
    setTimeout(() => {
      onVoteSubmitted(updatedRoom);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    hover: { 
      scale: 1.05, 
      transition: { duration: 0.2 } 
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
                You voted for: <strong>{selectedOption}</strong>
              </p>
              <p className="text-gray-500">
                Waiting for results...
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
            <p className="text-xl text-gray-600 mb-4">{room.title}</p>
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                {totalVotes} / {room.participants.length} voted
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          {shuffledOptions.map((option, index) => (
            <motion.div
              key={option}
              variants={cardVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={() => !userHasVoted && handleVote(option)}
            >
              <Card className={`
                transition-all duration-300 border-2
                ${selectedOption === option 
                  ? 'border-purple-500 bg-purple-50/90 shadow-lg' 
                  : 'border-gray-200 bg-white/90 hover:border-purple-300 hover:shadow-lg'
                }
                ${userHasVoted ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        Option {index + 1}
                      </div>
                      <div className="text-lg text-gray-800">
                        {option}
                      </div>
                    </div>
                    {selectedOption === option && (
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
        {selectedOption && !userHasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Button
              onClick={handleSubmitVote}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl px-8 py-4 rounded-full"
            >
              Submit Vote ✅
            </Button>
          </motion.div>
        )}

        {userHasVoted && (
          <div className="text-center">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="py-6">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-lg text-gray-600">
                  You already voted! Waiting for others...
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VotingScreen;
