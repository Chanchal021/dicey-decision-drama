
import { Screen, User, Room } from "@/types";
import { useResultsLogic } from "@/hooks/useResultsLogic";
import ErrorDisplay from "./results/ErrorDisplay";
import ResultsContent from "./results/ResultsContent";

interface ResultsScreenProps {
  room: Room | null;
  user: User | null;
  onComplete: (room: Room) => void;
  onNavigate: (screen: Screen) => void;
}

const ResultsScreen = ({ room, user, onComplete, onNavigate }: ResultsScreenProps) => {
  const {
    showTiebreaker,
    tiebreakerResult,
    isAnimating,
    voteResults,
    handleTiebreaker,
    handleTiebreakerExit,
    handleFinish
  } = useResultsLogic({ room, user, onComplete });

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

  return (
    <ResultsContent
      room={room}
      voteResults={voteResults}
      winnersCount={winners.length}
      maxVotes={maxVotes}
      hasTie={hasTie}
      showTiebreaker={showTiebreaker}
      isAnimating={isAnimating}
      tiebreakerResult={tiebreakerResult}
      onTiebreaker={handleTiebreaker}
      onFinish={handleFinish}
      onNavigate={onNavigate}
      onTiebreakerExit={handleTiebreakerExit}
    />
  );
};

export default ResultsScreen;
