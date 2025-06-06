
import { useState, useEffect } from "react";
import { Screen, User, Room } from "@/types";

interface UseNavigationHandlerProps {
  user: User | null;
  rooms: Room[];
  authLoading: boolean;
}

export const useNavigationHandler = ({ user, rooms, authLoading }: UseNavigationHandlerProps) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [initialRoomCode, setInitialRoomCode] = useState<string | null>(null);

  const currentRoom = currentRoomId ? rooms.find(r => r.id === currentRoomId) : null;

  // Check for room code in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    if (roomCode) {
      setInitialRoomCode(roomCode);
      // Clear the URL parameter for cleaner URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle navigation based on user login status and room code
  useEffect(() => {
    if (initialRoomCode) {
      if (user) {
        // User is logged in and we have a room code
        if (currentScreen === "landing" || currentScreen === "login") {
          setCurrentScreen("join-room");
        }
      } else if (!authLoading) {
        // User is not logged in and we have a room code
        if (currentScreen === "landing") {
          setCurrentScreen("login");
        }
      }
    }
  }, [user, initialRoomCode, currentScreen, authLoading]);

  // Auto-navigate based on room state when room is selected
  useEffect(() => {
    if (currentRoom && currentScreen === "room-lobby") {
      const totalVotes = currentRoom.votes?.length || 0;
      const totalParticipants = currentRoom.room_participants?.length || 0;
      
      // If room is resolved, go to results
      if (currentRoom.resolved_at) {
        setCurrentScreen("results");
      }
      // If voting is active and all votes are in, go to results
      else if (currentRoom.is_voting_active && totalVotes >= totalParticipants && totalParticipants > 0) {
        setCurrentScreen("results");
      }
      // If voting is active but not all votes are in, go to voting
      else if (currentRoom.is_voting_active) {
        setCurrentScreen("voting");
      }
    }
  }, [currentRoom, currentScreen]);

  const handleRoomUpdated = (updatedRoom: any) => {
    console.log('Room updated:', updatedRoom);
  };

  const handleNavigateToRoom = (roomId: string) => {
    console.log('Navigating to room:', roomId);
    
    // Validate roomId
    if (!roomId || typeof roomId !== 'string') {
      console.error('Invalid room ID:', roomId);
      return;
    }

    setCurrentRoomId(roomId);
    const room = rooms.find(r => r.id === roomId);
    
    if (room) {
      const totalVotes = room.votes?.length || 0;
      const totalParticipants = room.room_participants?.length || 0;
      
      console.log('Room found, navigating to appropriate screen', {
        roomId,
        resolved: room.resolved_at,
        votingActive: room.is_voting_active,
        totalVotes,
        totalParticipants
      });
      
      // Navigate to appropriate screen based on room state
      if (room.resolved_at) {
        setCurrentScreen("results");
      } else if (room.is_voting_active && totalVotes >= totalParticipants && totalParticipants > 0) {
        setCurrentScreen("results");
      } else if (room.is_voting_active) {
        setCurrentScreen("voting");
      } else {
        setCurrentScreen("room-lobby");
      }
    } else {
      console.error('Room not found:', roomId);
      // Handle case where room is not found
      setCurrentScreen("dashboard");
    }
  };

  return {
    currentScreen,
    setCurrentScreen,
    currentRoomId,
    setCurrentRoomId,
    initialRoomCode,
    setInitialRoomCode,
    currentRoom,
    handleRoomUpdated,
    handleNavigateToRoom
  };
};
