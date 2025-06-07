
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

  const currentRoom = currentRoomId ? rooms.find(r => r.id === currentRoomId) || null : null;

  // Preserve navigation state in localStorage
  useEffect(() => {
    const savedScreen = localStorage.getItem('diceyDecisions_currentScreen') as Screen;
    const savedRoomId = localStorage.getItem('diceyDecisions_currentRoomId');
    
    if (savedScreen && !authLoading) {
      setCurrentScreen(savedScreen);
    }
    if (savedRoomId) {
      setCurrentRoomId(savedRoomId);
    }
  }, [authLoading]);

  // Save current state to localStorage whenever it changes
  useEffect(() => {
    if (currentScreen !== "landing") {
      localStorage.setItem('diceyDecisions_currentScreen', currentScreen);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentRoomId) {
      localStorage.setItem('diceyDecisions_currentRoomId', currentRoomId);
    } else {
      localStorage.removeItem('diceyDecisions_currentRoomId');
    }
  }, [currentRoomId]);

  // Check for room code in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    if (roomCode && roomCode.trim()) {
      console.log('Found room code in URL:', roomCode);
      setInitialRoomCode(roomCode.trim().toUpperCase());
      // Clear the URL parameter for cleaner URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle navigation based on user login status and room code
  useEffect(() => {
    if (initialRoomCode) {
      console.log('Processing initial room code:', initialRoomCode, 'User:', !!user, 'Auth loading:', authLoading);
      
      if (user) {
        // User is logged in and we have a room code
        if (currentScreen === "landing" || currentScreen === "login") {
          console.log('Navigating to join-room screen');
          setCurrentScreen("join-room");
        }
      } else if (!authLoading) {
        // User is not logged in and we have a room code
        if (currentScreen === "landing") {
          console.log('User not logged in, navigating to login');
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

  const handleRoomUpdated = (updatedRoom: Room) => {
    console.log('Room updated:', updatedRoom);
    
    // Update the room state if it matches current room
    if (currentRoomId === updatedRoom.id) {
      const totalVotes = updatedRoom.votes?.length || 0;
      const totalParticipants = updatedRoom.room_participants?.length || 0;
      
      // Auto-navigate based on updated room state
      if (updatedRoom.resolved_at && currentScreen !== "results") {
        setCurrentScreen("results");
      } else if (updatedRoom.is_voting_active && totalVotes >= totalParticipants && totalParticipants > 0 && currentScreen !== "results") {
        setCurrentScreen("results");
      } else if (updatedRoom.is_voting_active && currentScreen === "room-lobby") {
        setCurrentScreen("voting");
      }
    }
  };

  const handleNavigateToRoom = (roomId: string) => {
    console.log('Navigating to room:', roomId);
    
    // Validate roomId
    if (!roomId || typeof roomId !== 'string') {
      console.error('Invalid room ID provided:', roomId);
      setCurrentScreen("dashboard");
      return;
    }

    // Find the room in the current rooms list
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
      console.error('Room not found in current rooms list:', roomId);
      // Still set the roomId in case it gets loaded later
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
    
    const totalVotes = room.votes?.length || 0;
    const totalParticipants = room.room_participants?.length || 0;
    
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
  };

  // Clear saved state when user logs out
  useEffect(() => {
    if (!user && !authLoading) {
      localStorage.removeItem('diceyDecisions_currentScreen');
      localStorage.removeItem('diceyDecisions_currentRoomId');
      setCurrentRoomId(null);
      setCurrentScreen("landing");
    }
  }, [user, authLoading]);

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
