
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Screen } from "@/types";

interface WinnerDisplayProps {
  winner: string;
  onFinish: (winner: string) => void;
  onNavigate: (screen: Screen) => void;
}

const WinnerDisplay = ({ winner, onFinish, onNavigate }: WinnerDisplayProps) => {
  return (
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
            {winner}
          </div>
          <Button
            onClick={() => onFinish(winner)}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl px-8 py-4 rounded-full"
          >
            <Home className="w-6 h-6 mr-2" />
            Finish & Go Home
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WinnerDisplay;
