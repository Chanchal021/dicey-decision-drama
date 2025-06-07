
import { useState } from "react";
import { Screen } from "@/types";

export const useNavigationState = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [initialRoomCode, setInitialRoomCode] = useState<string | null>(null);
  const [allowAutoNavigation, setAllowAutoNavigation] = useState(true);

  return {
    currentScreen,
    setCurrentScreen,
    currentRoomId,
    setCurrentRoomId,
    initialRoomCode,
    setInitialRoomCode,
    allowAutoNavigation,
    setAllowAutoNavigation
  };
};
