
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Room } from './types';
import { useProfileManager } from './useProfileManager';
import { fetchAndFormatRoom } from './useRoomDataFetcher';

export const useRoomJoining = (userId?: string, refetchRooms?: () => void) => {
  const { toast } = useToast();
  const { ensureUserProfile } = useProfileManager();

  const joinRoom = async (roomCode: string, displayName: string): Promise<Room | null> => {
    console.log('=== JOIN ROOM OPERATION START ===');
    console.log('🔍 Input parameters:');
    console.log('  - User ID:', userId);
    console.log('  - Room Code:', roomCode);
    console.log('  - Display Name:', displayName);
    
    if (!userId) {
      console.log('❌ JOIN FAILED: No user ID');
      toast({
        title: "Authentication required",
        description: "You must be logged in to join a room",
        variant: "destructive"
      });
      return null;
    }

    if (!roomCode?.trim()) {
      console.log('❌ JOIN FAILED: No room code provided');
      toast({
        title: "Invalid room code",
        description: "Please enter a valid room code",
        variant: "destructive"
      });
      return null;
    }

    if (!displayName?.trim()) {
      console.log('❌ JOIN FAILED: No display name provided');
      toast({
        title: "Display name required",
        description: "Please enter your display name",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Ensure the user profile exists
      const profileReady = await ensureUserProfile(userId);
      if (!profileReady) {
        return null;
      }

      const normalizedCode = roomCode.toUpperCase().trim();
      console.log('🔄 Normalized room code:', normalizedCode);

      // Find open rooms by code
      console.log('🔍 Searching for open room...');
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', normalizedCode)
        .eq('is_open', true);

      console.log('📊 Room query details:');
      console.log('  - Query: open rooms with code:', normalizedCode);
      console.log('  - Results count:', roomData?.length || 0);
      console.log('  - Room data:', roomData);
      console.log('  - Room error:', roomError);

      if (roomError) {
        console.error('❌ Database error finding room:', roomError);
        toast({
          title: "Error finding room",
          description: roomError.message,
          variant: "destructive"
        });
        return null;
      }

      if (!roomData || roomData.length === 0) {
        console.log('❌ No open room found with code:', normalizedCode);
        toast({
          title: "Room not found",
          description: `No open room exists with code "${normalizedCode}"`,
          variant: "destructive"
        });
        return null;
      }

      const room = roomData[0];
      console.log('✅ Room found:', {
        id: room.id,
        title: room.title,
        code: room.code,
        is_open: room.is_open,
        max_participants: room.max_participants
      });

      // Check current participants
      console.log('👥 Checking current participants...');
      const { data: participants, error: participantsError } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', room.id);

      console.log('👥 Participants query result:', { participants, participantsError });

      if (participantsError) {
        console.error('❌ Error checking participants:', participantsError);
        toast({
          title: "Error joining room",
          description: "Could not verify room capacity",
          variant: "destructive"
        });
        return null;
      }

      const currentParticipants = participants?.length || 0;
      console.log('📊 Participant stats:');
      console.log('  - Current participants:', currentParticipants);
      console.log('  - Max participants:', room.max_participants);

      // Check capacity
      if (room.max_participants && currentParticipants >= room.max_participants) {
        console.log('❌ Room is at capacity');
        toast({
          title: "Room is full",
          description: `This room has reached its maximum capacity of ${room.max_participants} participants`,
          variant: "destructive"
        });
        return null;
      }

      // Check if user is already in room
      const isAlreadyParticipant = participants?.some(p => p.user_id === userId);
      console.log('🔍 User already participant?', isAlreadyParticipant);

      if (isAlreadyParticipant) {
        console.log('ℹ️ User already in room, fetching complete data');
        toast({
          title: "Already in room",
          description: "You're already a participant in this room",
        });
        return await fetchAndFormatRoom(room.id);
      }

      // Add user to room
      console.log('➕ Adding user to room...');
      const { error: joinError } = await supabase
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: userId,
          display_name: displayName.trim()
        });

      console.log('📝 Join insertion result:', { joinError });

      if (joinError) {
        console.error('❌ Error joining room:', joinError);
        toast({
          title: "Failed to join room",
          description: joinError.message,
          variant: "destructive"
        });
        return null;
      }

      console.log('✅ Successfully joined room!');
      toast({
        title: "Successfully joined room!",
        description: `Welcome to "${room.title}"`,
      });

      if (refetchRooms) {
        refetchRooms();
      }

      const completeRoom = await fetchAndFormatRoom(room.id);
      console.log('=== JOIN ROOM OPERATION END ===');
      return completeRoom;

    } catch (error) {
      console.error('❌ Unexpected error joining room:', error);
      toast({
        title: "Failed to join room",
        description: "An unexpected error occurred while joining the room",
        variant: "destructive"
      });
      return null;
    }
  };

  return { joinRoom };
};
