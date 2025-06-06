
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRooms } from "@/hooks/useRooms";
import LandingPage from "@/components/LandingPage";
import LoginScreen from "@/components/LoginScreen";
import Dashboard from "@/components/Dashboard";
import CreateRoom from "@/components/CreateRoom";
import JoinRoom from "@/components/JoinRoom";
import RoomLobby from "@/components/RoomLobby";
import VotingScreen from "@/components/VotingScreen";
import ResultsScreen from "@/components/ResultsScreen";
import PastDecisions from "@/components/PastDecisions";
import { Screen } from "@/types";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [initialRoomCode, setInitialRoomCode] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { rooms, loading: roomsLoading, createRoom, joinRoom } = useRooms(user?.id);

  const currentRoom = currentRoomId ? rooms.find(r => r.id === currentRoomId) : null;

  // Check for room code in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    if (roomCode) {
      setInitialRoomCode(roomCode);
      // Clear the URL parameter for cleaner URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // If user is logged in, go directly to join room
      if (user) {
        setCurrentScreen("join-room");
      } else {
        // If not logged in, go to login first
        setCurrentScreen("login");
      }
    }
  }, [user]);

  // Auto-navigate to join room after login if there was a room code
  useEffect(() => {
    if (user && initialRoomCode && currentScreen === "login") {
      setCurrentScreen("join-room");
    }
  }, [user, initialRoomCode, currentScreen]);

  const screenVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const handleRoomUpdated = (updatedRoom: any) => {
    // This would typically update the room in the backend
    // For now, we'll just log it
    console.log('Room updated:', updatedRoom);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "landing":
        return <LandingPage onNavigate={setCurrentScreen} />;
      case "login":
        return <LoginScreen onNavigate={setCurrentScreen} />;
      case "dashboard":
        return <Dashboard user={user} rooms={rooms} onNavigate={setCurrentScreen} />;
      case "create-room":
        return <CreateRoom 
          user={user}
          onRoomCreated={async (roomData) => {
            const room = await createRoom(roomData);
            if (room) {
              setCurrentRoomId(room.id);
              setCurrentScreen("room-lobby");
            }
          }} 
          onNavigate={setCurrentScreen} 
        />;
      case "join-room":
        return <JoinRoom 
          onRoomJoined={async (roomCode, displayName) => {
            // Use initial room code if available, otherwise use the entered code
            const codeToUse = initialRoomCode || roomCode;
            const room = await joinRoom(codeToUse, displayName);
            if (room) {
              setCurrentRoomId(room.id);
              setCurrentScreen("room-lobby");
              setInitialRoomCode(null); // Clear the initial room code
            }
          }} 
          onNavigate={setCurrentScreen} 
        />;
      case "room-lobby":
        return <RoomLobby 
          room={currentRoom} 
          user={user}
          onRoomUpdated={handleRoomUpdated}
          onNavigate={setCurrentScreen} 
        />;
      case "voting":
        return <VotingScreen 
          room={currentRoom} 
          user={user}
          onVoteSubmitted={() => {
            setCurrentScreen("results");
          }} 
          onNavigate={setCurrentScreen} 
        />;
      case "results":
        return <ResultsScreen 
          room={currentRoom} 
          user={user}
          onComplete={() => {
            setCurrentScreen("dashboard");
          }} 
          onNavigate={setCurrentScreen} 
        />;
      case "past-decisions":
        return <PastDecisions 
          user={user}
          rooms={rooms.filter(r => r.resolved_at)} 
          onNavigate={setCurrentScreen} 
        />;
      default:
        return <LandingPage onNavigate={setCurrentScreen} />;
    }
  };

  // Pre-fill room code if we have one
  useEffect(() => {
    if (initialRoomCode && currentScreen === "join-room") {
      // We'll handle this in the JoinRoom component by passing the code
    }
  }, [initialRoomCode, currentScreen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
