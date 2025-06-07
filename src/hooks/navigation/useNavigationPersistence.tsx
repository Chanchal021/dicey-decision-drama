
import { useEffect } from "react";
import { Screen } from "@/types";

interface UseNavigationPersistenceProps {
  currentScreen: Screen;
  currentRoomId: string | null;
  authLoading: boolean;
  setCurrentScreen: (screen: Screen) => void;
  setCurrentRoomId: (roomId: string | null) => void;
}

export const useNavigationPersistence = ({
  currentScreen,
  currentRoomId,
  authLoading,
  setCurrentScreen,
  setCurrentRoomId
}: UseNavigationPersistenceProps) => {
  // Restore navigation state from localStorage
  useEffect(() => {
    const savedScreen = localStorage.getItem('diceyDecisions_currentScreen') as Screen;
    const savedRoomId = localStorage.getItem('diceyDecisions_currentRoomId');
    
    if (savedScreen && !authLoading) {
      setCurrentScreen(savedScreen);
    }
    if (savedRoomId) {
      setCurrentRoomId(savedRoomId);
    }
  }, [authLoading, setCurrentScreen, setCurrentRoomId]);

  // Save current state to localStorage whenever it changes
  useEffect(() => {
    if (currentScreen !== "landing") {
      localStorage.setItem('diceyDecisions_currentScreen', currentScreen);
    } else {
      localStorage.removeItem('diceyDecisions_currentScreen');
    }
  }, [currentScreen]);

  useEffect(() => {
    if (currentRoomId) {
      localStorage.setItem('diceyDecisions_currentRoomId', currentRoomId);
    } else {
      localStorage.removeItem('diceyDecisions_currentRoomId');
    }
  }, [currentRoomId]);

  const clearNavigationState = () => {
    localStorage.removeItem('diceyDecisions_currentScreen');
    localStorage.removeItem('diceyDecisions_currentRoomId');
  };

  return { clearNavigationState };
};
