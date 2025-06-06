
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateRoomData, Room } from './types';

export const useRoomOperations = (userId?: string, refetchRooms?: () => void) => {
  const { toast } = useToast();

  const createRoom = async (roomData: CreateRoomData) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a room",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Generate room code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_room_code');

      if (codeError) {
        throw codeError;
      }

      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          title: roomData.title,
          description: roomData.description,
          code: codeData,
          max_participants: roomData.maxParticipants,
          creator_id: userId,
          options: roomData.options
        })
        .select()
        .single();

      if (roomError) {
        throw roomError;
      }

      // Get user profile for display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single();

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          room_id: room.id,
          user_id: userId,
          display_name: profile?.display_name || 'You'
        });

      if (participantError) {
        console.error('Error adding creator as participant:', participantError);
      }

      toast({
        title: "Room created! 🎉",
        description: `Room code: ${room.code}`,
      });

      if (refetchRooms) {
        await refetchRooms();
      }
      return room;
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({
        title: "Failed to create room",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const joinRoom = async (roomCode: string, displayName: string) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to join a room",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Find room by code - explicitly specify the table alias to avoid ambiguity
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();

      if (roomError || !room) {
        toast({
          title: "Room not found 😕",
          description: `No room found with code "${roomCode}"`,
          variant: "destructive"
        });
        return null;
      }

      // Check if room is full
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('id')
        .eq('room_id', room.id);

      if (participantsError) {
        throw participantsError;
      }

      if (room.max_participants && participants.length >= room.max_participants) {
        toast({
          title: "Room is full 🚪",
          description: "This room has reached its participant limit",
          variant: "destructive"
        });
        return null;
      }

      // Check if user is already in the room
      const { data: existingParticipant } = await supabase
        .from('participants')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', userId)
        .single();

      if (!existingParticipant) {
        // Add user as participant
        const { error: joinError } = await supabase
          .from('participants')
          .insert({
            room_id: room.id,
            user_id: userId,
            display_name: displayName
          });

        if (joinError) {
          throw joinError;
        }
      }

      toast({
        title: "Joined successfully! 🎉",
        description: `Welcome to ${room.title}`,
      });

      if (refetchRooms) {
        await refetchRooms();
      }
      return room;
    } catch (error: any) {
      console.error('Error joining room:', error);
      toast({
        title: "Failed to join room",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    createRoom,
    joinRoom
  };
};
