
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

interface VotingResultsProps {
  sortedResults: [string, number][];
  totalVotes: number;
  maxVotes: number;
}

const VotingResults = ({ sortedResults, totalVotes, maxVotes }: VotingResultsProps) => {
  return (
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
  );
};

export default VotingResults;
