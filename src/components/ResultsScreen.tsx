import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Screen, User, Room } from "@/types";
import { Trophy, RotateCcw, Home } from "lucide-react";

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

  if (!room || !user) return null;

  // Calculate vote results with proper typing
  const voteResults = room.options.reduce((acc, option) => {
    const voteCount = (room.votes || []).filter(vote => vote.option === option).length;
    acc[option] = voteCount;
    return acc;
  }, {} as Record<string, number>);

  const sortedResults = Object.entries(voteResults).sort(([,a], [,b]) => b - a);
  const maxVotes = Math.max(...Object.values(voteResults));
  const winners = sortedResults.filter(([,votes]) => votes === maxVotes);
  const hasTie = winners.length > 1;
  const totalVotes = (room.votes || []).length;

  const handleTiebreaker = (method: "dice" | "spinner" | "coin") => {
    setIsAnimating(true);
    setShowTiebreaker(true);

    // Simulate tiebreaker animation
    setTimeout(() => {
      const randomWinner = winners[Math.floor(Math.random() * winners.length)][0];
      setTiebreakerResult(randomWinner);
      
      const updatedRoom = {
        ...room,
        finalChoice: randomWinner,
        tiebreakerUsed: method,
        resolvedAt: new Date()
      };

      setTimeout(() => {
        setIsAnimating(false);
        onComplete(updatedRoom);
      }, 2000);
    }, 3000);
  };

  const TiebreakerAnimation = ({ method }: { method: "dice" | "spinner" | "coin" }) => {
    const getEmoji = () => {
      switch (method) {
        case "dice": return "🎲";
        case "spinner": return "🎡";
        case "coin": return "🪙";
      }
    };

    const getAnimation = () => {
      switch (method) {
        case "dice":
          return {
            rotate: [0, 180, 360, 540, 720],
            scale: [1, 1.2, 1, 1.2, 1]
          };
        case "spinner":
          return {
            rotate: [0, 360, 720, 1080, 1440],
            scale: [1, 1.1, 1]
          };
        case "coin":
          return {
            rotateY: [0, 180, 360, 540, 720],
            scale: [1, 1.2, 1, 1.2, 1]
          };
      }
    };

    return (
      <motion.div
        className="text-8xl"
        animate={getAnimation()}
        transition={{ duration: 3, ease: "easeOut" }}
      >
        {getEmoji()}
      </motion.div>
    );
  };

  if (showTiebreaker && isAnimating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="py-16">
              <h2 className="text-4xl font-bold text-purple-600 mb-8">
                🎭 Tiebreaker Time! 🎭
              </h2>
              <TiebreakerAnimation method={room.tiebreakerUsed!} />
              <p className="text-xl text-gray-600 mt-8">
                Let fate decide...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (tiebreakerResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <CardContent className="py-16">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 1, repeat: 3 }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>
              <h2 className="text-4xl font-bold text-yellow-600 mb-4">
                We Have a Winner!
              </h2>
              <div className="text-3xl font-bold text-purple-600 mb-4">
                {tiebreakerResult}
              </div>
              <p className="text-lg text-gray-600 mb-8">
                Decided by {room.tiebreakerUsed === 'dice' ? '🎲 dice roll' : 
                          room.tiebreakerUsed === 'coin' ? '🪙 coin flip' : 
                          '🎡 spinner'}
              </p>
              <Button
                onClick={() => onNavigate("dashboard")}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl px-8 py-4 rounded-full"
              >
                <Home className="w-6 h-6 mr-2" />
                Back to Dashboard
              </Button>
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
            <div className="text-4xl mb-2">📊</div>
            <CardTitle className="text-3xl font-bold text-purple-600 mb-2">
              Voting Results
            </CardTitle>
            <p className="text-xl text-gray-600">{room.title}</p>
          </CardHeader>
        </Card>

        {/* Results */}
        <div className="space-y-4 mb-8">
          {sortedResults.map(([option, votes], index) => {
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            const isWinner = votes === maxVotes;
            
            return (
              <motion.div
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className={`
                  transition-all duration-300 border-2
                  ${isWinner ? 'border-yellow-400 bg-yellow-50/90 shadow-lg' : 'border-gray-200 bg-white/90'}
                `}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {isWinner && <Trophy className="w-6 h-6 text-yellow-500" />}
                        <span className="text-xl font-bold text-purple-600">
                          {option}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-700">
                        {votes} vote{votes !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Winner or Tiebreaker */}
        {!hasTie ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-400 shadow-2xl">
              <CardContent className="py-12">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🏆
                </motion.div>
                <h2 className="text-4xl font-bold text-yellow-600 mb-4">
                  Winner!
                </h2>
                <div className="text-3xl font-bold text-purple-600 mb-6">
                  {winners[0][0]}
                </div>
                <Button
                  onClick={() => {
                    const updatedRoom = {
                      ...room,
                      finalChoice: winners[0][0],
                      resolvedAt: new Date()
                    };
                    onComplete(updatedRoom);
                  }}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl px-8 py-4 rounded-full"
                >
                  <Home className="w-6 h-6 mr-2" />
                  Finish & Go Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-400 shadow-2xl">
              <CardContent className="py-12">
                <div className="text-6xl mb-4">🤝</div>
                <h2 className="text-4xl font-bold text-purple-600 mb-4">
                  It's a Tie!
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  {winners.length} options tied with {maxVotes} vote{maxVotes !== 1 ? 's' : ''} each.
                  <br />Choose a tiebreaker method:
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => handleTiebreaker("dice")}
                    className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold text-lg py-6 rounded-xl"
                  >
                    <span className="text-3xl mb-2 block">🎲</span>
                    Dice Roll
                  </Button>
                  
                  <Button
                    onClick={() => handleTiebreaker("spinner")}
                    className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-lg py-6 rounded-xl"
                  >
                    <span className="text-3xl mb-2 block">🎡</span>
                    Spinner
                  </Button>
                  
                  <Button
                    onClick={() => handleTiebreaker("coin")}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold text-lg py-6 rounded-xl"
                  >
                    <span className="text-3xl mb-2 block">🪙</span>
                    Coin Flip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResultsScreen;
