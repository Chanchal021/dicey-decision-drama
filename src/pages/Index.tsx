
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginScreen from "@/components/LoginScreen";
import Dashboard from "@/components/Dashboard";
import CreateRoom from "@/components/CreateRoom";
import JoinRoom from "@/components/JoinRoom";
import RoomLobby from "@/components/RoomLobby";
import VotingScreen from "@/components/VotingScreen";
import ResultsScreen from "@/components/ResultsScreen";
import PastDecisions from "@/components/PastDecisions";

export type Screen = 
  | "login" 
  | "dashboard" 
  | "create-room" 
  | "join-room" 
  | "room-lobby" 
  | "voting" 
  | "results" 
  | "past-decisions";

export interface Room {
  id: string;
  title: string;
  description?: string;
  maxParticipants?: number;
  code: string;
  creator: string;
  participants: string[];
  options: string[];
  votes: Record<string, string>;
  isVotingActive: boolean;
  finalChoice?: string;
  tiebreakerUsed?: "dice" | "spinner" | "coin";
  createdAt: Date;
  resolvedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [user, setUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  const screenVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return <LoginScreen onLogin={setUser} onNavigate={setCurrentScreen} />;
      case "dashboard":
        return <Dashboard user={user} rooms={rooms} onNavigate={setCurrentScreen} />;
      case "create-room":
        return <CreateRoom user={user} onRoomCreated={(room) => {
          setRooms(prev => [...prev, room]);
          setCurrentRoom(room);
          setCurrentScreen("room-lobby");
        }} onNavigate={setCurrentScreen} />;
      case "join-room":
        return <JoinRoom user={user} rooms={rooms} onRoomJoined={(room) => {
          setCurrentRoom(room);
          setCurrentScreen("room-lobby");
        }} onNavigate={setCurrentScreen} />;
      case "room-lobby":
        return <RoomLobby room={currentRoom} user={user} onRoomUpdated={setCurrentRoom} onNavigate={setCurrentScreen} />;
      case "voting":
        return <VotingScreen room={currentRoom} user={user} onVoteSubmitted={(room) => {
          setCurrentRoom(room);
          setCurrentScreen("results");
        }} onNavigate={setCurrentScreen} />;
      case "results":
        return <ResultsScreen room={currentRoom} user={user} onComplete={(room) => {
          setRooms(prev => prev.map(r => r.id === room.id ? room : r));
          setCurrentScreen("dashboard");
        }} onNavigate={setCurrentScreen} />;
      case "past-decisions":
        return <PastDecisions user={user} rooms={rooms} onNavigate={setCurrentScreen} />;
      default:
        return <LoginScreen onLogin={setUser} onNavigate={setCurrentScreen} />;
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
