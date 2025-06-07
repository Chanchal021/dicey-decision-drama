
import { useRoomData } from './rooms/useRoomData';
import { useRoomOperations } from './rooms/useRoomOperations';
import { useRoomsRealtime } from './rooms/useRoomsRealtime';

export type { Room } from './rooms/types';

export const useRooms = (userId?: string) => {
  const { rooms, loading, fetchRooms, error } = useRoomData(userId);
  const { createRoom, joinRoom } = useRoomOperations(userId, fetchRooms);
  
  // Set up real-time subscriptions for user's rooms list
  useRoomsRealtime(userId, fetchRooms);

  return {
    rooms,
    loading,
    error,
    createRoom,
    joinRoom,
    refetch: fetchRooms
  };
};
