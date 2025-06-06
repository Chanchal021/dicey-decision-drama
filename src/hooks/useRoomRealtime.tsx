
import { useRealtimeSubscription } from './rooms/useRealtimeSubscription';
import { Room } from './rooms/types';

interface UseRoomRealtimeProps {
  roomId: string | null;
  onRoomUpdate: (room: Room) => void;
}

export const useRoomRealtime = ({ roomId, onRoomUpdate }: UseRoomRealtimeProps) => {
  // Only set up subscription if roomId exists and is valid
  if (roomId && typeof roomId === 'string' && roomId.length > 0) {
    try {
      useRealtimeSubscription({ roomId, onRoomUpdate });
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  }
};
