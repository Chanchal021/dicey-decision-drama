
import TiebreakerSelector from "./TiebreakerSelector";
import TiebreakerAnimationScreen from "./TiebreakerAnimationScreen";
import TiebreakerResult from "./TiebreakerResult";
import { Room } from "@/types";

interface TiebreakerFlowProps {
  room: Room;
  winnersCount: number;
  maxVotes: number;
  showTiebreaker: boolean;
  isAnimating: boolean;
  tiebreakerResult: string | null;
  onTiebreaker: (method: "dice" | "spinner" | "coin") => void;
  onNavigate: () => void;
}

const TiebreakerFlow = ({
  room,
  winnersCount,
  maxVotes,
  showTiebreaker,
  isAnimating,
  tiebreakerResult,
  onTiebreaker,
  onNavigate
}: TiebreakerFlowProps) => {
  if (showTiebreaker && isAnimating) {
    return (
      <TiebreakerAnimationScreen 
        method={room.tiebreaker_used as "dice" | "spinner" | "coin"} 
      />
    );
  }

  if (tiebreakerResult) {
    return (
      <TiebreakerResult 
        winner={tiebreakerResult}
        method={room.tiebreaker_used || ''}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <TiebreakerSelector 
      winnersCount={winnersCount}
      maxVotes={maxVotes}
      onTiebreaker={onTiebreaker}
    />
  );
};

export default TiebreakerFlow;
