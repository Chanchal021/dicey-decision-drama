
import { useEffect } from "react";
import { Screen, User, Room } from "@/types";
import { useNavigationState } from "./navigation/useNavigationState";
import { useNavigationPersistence } from "./navigation/useNavigationPersistence";
import { useUrlParamHandler } from "./navigation/useUrlParamHandler";
import { useAutoNavigation } from "./navigation/useAutoNavigation";
import { useRoomNavigation } from "./navigation/useRoomNavigation";

interface UseNavigationHandlerProps {
  user: User | null;
  rooms: Room[];
  authLoading: boolean;
}

export const useNavigationHandler = ({ user, rooms, authLoading }: UseNavigationHandlerProps) => {
  const {
    currentScreen,
    setCurrentScreen: setScreenState,
    currentRoomId,
    setCurrentRoomId,
    initialRoomCode,
    setInitialRoomCode,
    allowAutoNavigation,
    setAllowAutoNavigation
  } = useNavigationState();

  const currentRoom = currentRoomId ? rooms.find(r => r.id === currentRoomId) || null : null;

  const { clearNavigationState } = useNavigationPersistence({
    currentScreen,
    currentRoomId,
    authLoading,
    setCurrentScreen: setScreenState,
    setCurrentRoomId
  });

  useUrlParamHandler({
    user,
    authLoading,
    currentScreen,
    initialRoomCode,
    setInitialRoomCode,
    setCurrentScreen: setScreenState
  });

  useAutoNavigation({
    currentRoom,
    currentRoomId,
    currentScreen,
    allowAutoNavigation,
    setCurrentScreen: setScreenState
  });

  const { handleRoomUpdated, handleNavigateToRoom } = useRoomNavigation({
    rooms,
    setCurrentRoomId,
    setCurrentScreen: setScreenState,
    setAllowAutoNavigation
  });

  // Enhanced setCurrentScreen to handle back to home and disable auto-navigation
  const handleSetCurrentScreen = (screen: Screen) => {
    console.log('Manual navigation to:', screen, 'from:', currentScreen);
    
    if (screen === "landing") {
      setCurrentRoomId(null);
      setAllowAutoNavigation(false);
      clearNavigationState();
    } else if (screen === "dashboard") {
      setAllowAutoNavigation(false);
      setCurrentRoomId(null);
      localStorage.removeItem('diceyDecisions_currentRoomId');
    } else if (["create-room", "join-room", "past-decisions"].includes(screen)) {
      setAllowAutoNavigation(false);
    }
    
    setScreenState(screen);
  };

  // Clear saved state when user logs out
  useEffect(() => {
    if (!user && !authLoading) {
      clearNavigationState();
      setCurrentRoomId(null);
      setScreenState("landing");
      setAllowAutoNavigation(true);
    }
  }, [user, authLoading, clearNavigationState, setCurrentRoomId, setAllowAutoNavigation]);

  return {
    currentScreen,
    setCurrentScreen: handleSetCurrentScreen,
    currentRoomId,
    setCurrentRoomId,
    initialRoomCode,
    setInitialRoomCode,
    currentRoom,
    handleRoomUpdated,
    handleNavigateToRoom
  };
};
