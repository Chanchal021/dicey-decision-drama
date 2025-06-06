
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
import { Card, CardContent } from "@/components/ui/card";

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

  const ErrorFallback = ({ error, screen }: { error: string; screen: string }) => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 flex items-center justify-center p-4">
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Error on {screen} screen: {error}</p>
          <button
            onClick={() => setCurrentScreen("dashboard")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-2 rounded-full"
          >
            Back to Dashboard
          </button>
        </CardContent>
      </Card>
    </div>
  );

  const renderScreen = () => {
    try {
      switch (currentScreen) {
        case "landing":
          return <LandingPage onNavigate={setCurrentScreen} />;
        case "login":
          return <LoginScreen onNavigate={setCurrentScreen} />;
        case "dashboard":
          return <Dashboard user={user} rooms={rooms} onNavigate={setCurrentScreen} onNavigateToRoom={handleNavigateToRoom} />;
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
            initialRoomCode={initialRoomCode}
            onRoomJoined={async (roomCode, displayName) => {
              const codeToUse = initialRoomCode || roomCode;
              const room = await joinRoom(codeToUse, displayName);
              if (room) {
                setCurrentRoomId(room.id);
                handleNavigateToRoom(room.id);
                setInitialRoomCode(null);
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
    } catch (error) {
      console.error('Error rendering screen:', error);
      return <ErrorFallback error={error instanceof Error ? error.message : 'Unknown error'} screen={currentScreen} />;
    }
  };

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
