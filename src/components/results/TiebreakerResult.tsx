
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Screen } from "@/types";

interface TiebreakerResultProps {
  winner: string;
  method: string;
  onNavigate: (screen: Screen) => void;
}

const TiebreakerResult = ({ winner, method, onNavigate }: TiebreakerResultProps) => {
  const getMethodDisplay = () => {
    switch (method) {
      case 'dice': return '🎲 dice roll';
      case 'coin': return '🪙 coin flip';
      case 'spinner': return '🎡 spinner';
      default: return method;
    }
  };

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
              {winner}
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Decided by {getMethodDisplay()}
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
};

export default TiebreakerResult;
