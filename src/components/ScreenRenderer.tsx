
import LandingPage from "@/components/LandingPage";
import LoginScreen from "@/components/LoginScreen";
import Dashboard from "@/components/Dashboard";
import CreateRoom from "@/components/CreateRoom";
import JoinRoom from "@/components/JoinRoom";
import RoomLobby from "@/components/RoomLobby";
import VotingScreen from "@/components/VotingScreen";
import ResultsScreen from "@/components/ResultsScreen";
import PastDecisions from "@/components/PastDecisions";
import ErrorFallback from "@/components/ErrorFallback";
import { Screen, User, Room } from "@/types";

interface ScreenRendererProps {
  currentScreen: Screen;
  user: User | null;
  rooms: Room[];
  currentRoom: Room | null;
  initialRoomCode: string | null;
  onNavigate: (screen: Screen) => void;
  onNavigateToRoom: (roomId: string) => void;
  onRoomUpdated: (room: Room) => void;
  onCreateRoom: (roomData: any) => Promise<void>;
  onJoinRoom: (roomCode: string, displayName: string) => Promise<void>;
  setInitialRoomCode: (code: string | null) => void;
  setCurrentScreen: (screen: Screen) => void;
}

const ScreenRenderer = ({
  currentScreen,
  user,
  rooms,
  currentRoom,
  initialRoomCode,
  onNavigate,
  onNavigateToRoom,
  onRoomUpdated,
  onCreateRoom,
  onJoinRoom,
  setInitialRoomCode,
  setCurrentScreen
}: ScreenRendererProps) => {
  try {
    switch (currentScreen) {
      case "landing":
        return <LandingPage onNavigate={onNavigate} />;
      case "login":
        return <LoginScreen onNavigate={onNavigate} />;
      case "dashboard":
        return <Dashboard user={user} rooms={rooms} onNavigate={onNavigate} onNavigateToRoom={onNavigateToRoom} />;
      case "create-room":
        return <CreateRoom 
          user={user}
          onRoomCreated={onCreateRoom}
          onNavigate={onNavigate} 
        />;
      case "join-room":
        return <JoinRoom 
          initialRoomCode={initialRoomCode}
          onRoomJoined={async (roomCode, displayName) => {
            const codeToUse = initialRoomCode || roomCode;
            await onJoinRoom(codeToUse, displayName);
            setInitialRoomCode(null);
          }} 
          onNavigate={onNavigate} 
        />;
      case "room-lobby":
        return <RoomLobby 
          room={currentRoom} 
          user={user}
          onRoomUpdated={onRoomUpdated}
          onNavigate={onNavigate} 
        />;
      case "voting":
        return <VotingScreen 
          room={currentRoom} 
          user={user}
          onVoteSubmitted={() => {
            setCurrentScreen("results");
          }} 
          onNavigate={onNavigate} 
        />;
      case "results":
        return <ResultsScreen 
          room={currentRoom} 
          user={user}
          onComplete={() => {
            setCurrentScreen("dashboard");
          }} 
          onNavigate={onNavigate} 
        />;
      case "past-decisions":
        return <PastDecisions 
          user={user}
          rooms={rooms.filter(r => r.resolved_at)} 
          onNavigate={onNavigate} 
        />;
      default:
        return <LandingPage onNavigate={onNavigate} />;
    }
  } catch (error) {
    console.error('Error rendering screen:', error);
    return <ErrorFallback error={error instanceof Error ? error.message : 'Unknown error'} screen={currentScreen} onNavigate={onNavigate} />;
  }
};

export default ScreenRenderer;
