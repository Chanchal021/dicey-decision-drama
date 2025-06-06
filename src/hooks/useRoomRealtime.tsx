
import { useRealtimeSubscription } from './rooms/useRealtimeSubscription';
import { Room } from './rooms/types';

interface UseRoomRealtimeProps {
  roomId: string | null;
  onRoomUpdate: (room: Room) => void;
}

export const useRoomRealtime = ({ roomId, onRoomUpdate }: UseRoomRealtimeProps) => {
  // Only set up subscription if roomId exists
  if (roomId) {
    useRealtimeSubscription({ roomId, onRoomUpdate });
  }
};
