
import { useRoomData } from './rooms/useRoomData';
import { useRoomOperations } from './rooms/useRoomOperations';
import { useRoomRealtime } from './rooms/useRoomRealtime';

export type { Room } from './rooms/types';

export const useRooms = (userId?: string) => {
  const { rooms, loading, fetchRooms } = useRoomData(userId);
  const { createRoom, joinRoom } = useRoomOperations(userId, fetchRooms);
  
  // Set up real-time subscriptions
  useRoomRealtime(userId, fetchRooms);

  return {
    rooms,
    loading,
    createRoom,
    joinRoom,
    refetch: fetchRooms
  };
};
