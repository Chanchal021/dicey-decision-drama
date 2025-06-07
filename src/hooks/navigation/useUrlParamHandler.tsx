
import { useEffect } from "react";
import { Screen, User } from "@/types";

interface UseUrlParamHandlerProps {
  user: User | null;
  authLoading: boolean;
  currentScreen: Screen;
  initialRoomCode: string | null;
  setInitialRoomCode: (code: string | null) => void;
  setCurrentScreen: (screen: Screen) => void;
}

export const useUrlParamHandler = ({
  user,
  authLoading,
  currentScreen,
  initialRoomCode,
  setInitialRoomCode,
  setCurrentScreen
}: UseUrlParamHandlerProps) => {
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
  }, [setInitialRoomCode]);

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
  }, [user, initialRoomCode, currentScreen, authLoading, setCurrentScreen]);
};
