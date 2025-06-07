
import { useRoomCreation } from './useRoomCreation';
import { useRoomJoining } from './useRoomJoining';

export const useRoomOperations = (userId?: string, refetchRooms?: () => void) => {
  const { createRoom } = useRoomCreation(userId, refetchRooms);
  const { joinRoom } = useRoomJoining(userId, refetchRooms);

  return {
    createRoom,
    joinRoom
  };
};
