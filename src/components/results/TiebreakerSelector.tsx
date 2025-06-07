
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TiebreakerSelectorProps {
  winnersCount: number;
  maxVotes: number;
  onTiebreaker: (method: "dice" | "spinner" | "coin") => void;
}

const TiebreakerSelector = ({ winnersCount, maxVotes, onTiebreaker }: TiebreakerSelectorProps) => {
  return (
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
            {winnersCount} options tied with {maxVotes} vote{maxVotes !== 1 ? 's' : ''} each.
            <br />Choose a tiebreaker method:
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => onTiebreaker("dice")}
              className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white font-bold text-lg py-6 rounded-xl"
            >
              <span className="text-3xl mb-2 block">🎲</span>
              Dice Roll
            </Button>
            
            <Button
              onClick={() => onTiebreaker("spinner")}
              className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-lg py-6 rounded-xl"
            >
              <span className="text-3xl mb-2 block">🎡</span>
              Spinner
            </Button>
            
            <Button
              onClick={() => onTiebreaker("coin")}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold text-lg py-6 rounded-xl"
            >
              <span className="text-3xl mb-2 block">🪙</span>
              Coin Flip
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TiebreakerSelector;
