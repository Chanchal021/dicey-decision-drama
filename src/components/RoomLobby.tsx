
import { motion } from "framer-motion";
import { Room, User, Screen } from "@/types";
import RoomHeader from "@/components/room/RoomHeader";
import ParticipantsList from "@/components/room/ParticipantsList";
import DecisionOptions from "@/components/room/DecisionOptions";
import VotingStatus from "@/components/room/VotingStatus";
import { useRoomRealtime } from "@/hooks/useRoomRealtime";

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

  if (!room || !user) return null;

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <RoomHeader room={room} />
        <ParticipantsList room={room} user={user} />
        <DecisionOptions room={room} user={user} />
        <VotingStatus room={room} user={user} onNavigate={onNavigate} />
      </motion.div>
    </div>
  );
};

export default RoomLobby;
