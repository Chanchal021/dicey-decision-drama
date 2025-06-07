
import { useEffect } from "react";
import { Screen, Room } from "@/types";

interface UseAutoNavigationProps {
  currentRoom: Room | null;
  currentRoomId: string | null;
  currentScreen: Screen;
  allowAutoNavigation: boolean;
  setCurrentScreen: (screen: Screen) => void;
}

export const useAutoNavigation = ({
  currentRoom,
  currentRoomId,
  currentScreen,
  allowAutoNavigation,
  setCurrentScreen
}: UseAutoNavigationProps) => {
  // Auto-navigate based on room state when room is selected or updated
  useEffect(() => {
    if (currentRoom && currentRoomId && allowAutoNavigation) {
      const totalVotes = currentRoom.votes?.length || 0;
      const totalParticipants = currentRoom.room_participants?.length || 0;
      
      console.log('Room state changed:', {
        roomId: currentRoom.id,
        currentScreen,
        resolved: currentRoom.resolved_at,
        votingActive: currentRoom.is_voting_active,
        totalVotes,
        totalParticipants,
        autoNavAllowed: allowAutoNavigation
      });
      
      // If room is resolved, go to results
      if (currentRoom.resolved_at && currentScreen !== "results") {
        console.log('Room resolved, navigating to results');
        setCurrentScreen("results");
      }
      // If voting is active and all votes are in, go to results
      else if (currentRoom.is_voting_active && totalVotes >= totalParticipants && totalParticipants > 0 && currentScreen !== "results") {
        console.log('All votes collected, navigating to results');
        setCurrentScreen("results");
      }
      // If voting is active but not all votes are in, go to voting
      else if (currentRoom.is_voting_active && currentScreen !== "voting" && currentScreen !== "results") {
        console.log('Voting is active, navigating to voting screen');
        setCurrentScreen("voting");
      }
      // If voting is not active and we're on voting/results screens, go back to room lobby
      else if (!currentRoom.is_voting_active && !currentRoom.resolved_at && (currentScreen === "voting" || currentScreen === "results")) {
        console.log('Voting stopped, returning to room lobby');
        setCurrentScreen("room-lobby");
      }
    }
  }, [
    currentRoom?.is_voting_active,
    currentRoom?.resolved_at,
    currentRoom?.votes?.length,
    currentRoom?.room_participants?.length,
    currentRoomId,
    currentScreen,
    allowAutoNavigation,
    setCurrentScreen
  ]);
};
