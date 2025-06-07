
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Screen, Room } from "@/types";
import VotingResults from "./VotingResults";
import WinnerDisplay from "./WinnerDisplay";
import TiebreakerFlow from "./TiebreakerFlow";
import ErrorDisplay from "./ErrorDisplay";

interface ResultsContentProps {
  room: Room;
  voteResults: Record<string, number>;
  winnersCount: number;
  maxVotes: number;
  hasTie: boolean;
  showTiebreaker: boolean;
  isAnimating: boolean;
  tiebreakerResult: string | null;
  onTiebreaker: (method: "dice" | "spinner" | "coin") => void;
  onFinish: (winner: string) => void;
  onNavigate: (screen: Screen) => void;
  onTiebreakerExit: () => void;
}

const ResultsContent = ({
  room,
  voteResults,
  winnersCount,
  maxVotes,
  hasTie,
  showTiebreaker,
  isAnimating,
  tiebreakerResult,
  onTiebreaker,
  onFinish,
  onNavigate,
  onTiebreakerExit
}: ResultsContentProps) => {
  const sortedResults = Object.entries(voteResults).sort(([,a], [,b]) => b - a);
  const totalVotes = Object.values(voteResults).reduce((sum, votes) => sum + votes, 0);
  const winners = sortedResults.filter(([,votes]) => votes === maxVotes);

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
            onFinish={onFinish}
            onNavigate={onNavigate}
          />
        ) : hasTie && winners.length > 0 ? (
          <TiebreakerFlow
            room={room}
            winnersCount={winnersCount}
            maxVotes={maxVotes}
            showTiebreaker={showTiebreaker}
            isAnimating={isAnimating}
            tiebreakerResult={tiebreakerResult}
            onTiebreaker={onTiebreaker}
            onNavigate={onTiebreakerExit}
          />
        ) : (
          <ErrorDisplay type="no-results" onNavigate={onNavigate} />
        )}
      </motion.div>
    </div>
  );
};

export default ResultsContent;
