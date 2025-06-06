
import { motion } from "framer-motion";
import { Room, User, Screen } from "@/types";
import RoomHeader from "@/components/room/RoomHeader";
import ParticipantsList from "@/components/room/ParticipantsList";
import DecisionOptions from "@/components/room/DecisionOptions";
import VotingStatus from "@/components/room/VotingStatus";
import { useRoomRealtime } from "@/hooks/useRoomRealtime";
import { Card, CardContent } from "@/components/ui/card";

interface RoomLobbyProps {
  room: Room | null;
  user: User | null;
  onRoomUpdated: (room: Room) => void;
  onNavigate: (screen: Screen) => void;
}

const RoomLobby = ({ room, user, onRoomUpdated, onNavigate }: RoomLobbyProps) => {
  // Set up real-time updates for this specific room
  useRoomRealtime({
    roomId: room?.id || null,
    onRoomUpdate: onRoomUpdated
  });

  // Show loading state if data is missing
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access this room.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">Room Not Found</h2>
            <p className="text-gray-600 mb-4">The room you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => onNavigate("dashboard")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-2 rounded-full"
            >
              Back to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <RoomHeader room={room} onNavigate={onNavigate} />
        <ParticipantsList room={room} user={user} />
        <DecisionOptions room={room} user={user} />
        <VotingStatus room={room} user={user} onNavigate={onNavigate} />
      </motion.div>
    </div>
  );
};

export default RoomLobby;
