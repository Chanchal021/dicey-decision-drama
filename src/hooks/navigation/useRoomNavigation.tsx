
import { Room, Screen } from "@/types";

interface UseRoomNavigationProps {
  rooms: Room[];
  setCurrentRoomId: (roomId: string | null) => void;
  setCurrentScreen: (screen: Screen) => void;
  setAllowAutoNavigation: (allow: boolean) => void;
}

export const useRoomNavigation = ({
  rooms,
  setCurrentRoomId,
  setCurrentScreen,
  setAllowAutoNavigation
}: UseRoomNavigationProps) => {
  const handleRoomUpdated = (updatedRoom: Room) => {
    console.log('Room updated in navigation handler:', {
      roomId: updatedRoom.id,
      votingActive: updatedRoom.is_voting_active,
      resolved: updatedRoom.resolved_at
    });
  };

  const handleNavigateToRoom = (roomId: string) => {
    console.log('Navigating to room:', roomId);
    
    if (!roomId || typeof roomId !== 'string') {
      console.error('Invalid room ID provided:', roomId);
      setCurrentScreen("dashboard");
      return;
    }

    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
      console.error('Room not found in current rooms list:', roomId);
      setCurrentRoomId(roomId);
      setCurrentScreen("room-lobby");
      return;
    }

    console.log('Room found, setting current room and navigating', {
      roomId,
      resolved: room.resolved_at,
      votingActive: room.is_voting_active,
      totalVotes: room.votes?.length || 0,
      totalParticipants: room.room_participants?.length || 0
    });

    setCurrentRoomId(roomId);
    setAllowAutoNavigation(true);
    
    const totalVotes = room.votes?.length || 0;
    const totalParticipants = room.room_participants?.length || 0;
    
    if (room.resolved_at) {
      setCurrentScreen("results");
    } else if (room.is_voting_active && totalVotes >= totalParticipants && totalParticipants > 0) {
      setCurrentScreen("results");
    } else if (room.is_voting_active) {
      setCurrentScreen("voting");
    } else {
      setCurrentScreen("room-lobby");
    }
  };

  return {
    handleRoomUpdated,
    handleNavigateToRoom
  };
};
