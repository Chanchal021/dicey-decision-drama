
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateRoomData, Room } from './types';

export const useRoomOperations = (userId?: string, refetchRooms?: () => void) => {
  const { toast } = useToast();

  const createRoom = async (roomData: CreateRoomData): Promise<Room | null> => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a room",
        variant: "destructive"
      });
      return null;
    }

    try {
      // Create the room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          title: roomData.title,
          description: roomData.description,
          creator_id: userId,
          max_participants: roomData.maxParticipants
        })
        .select()
        .single();

      if (roomError) {
        console.error('Error creating room:', roomError);
        toast({
          title: "Failed to create room",
          description: roomError.message,
          variant: "destructive"
        });
        return null;
      }

      // Add creator as first participant
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: userId,
          display_name: roomData.title // Use room title as creator's display name for now
        });

      if (participantError) {
        console.error('Error adding creator as participant:', participantError);
        // Don't fail completely, just warn
        toast({
          title: "Warning",
          description: "Room created but failed to add you as participant",
          variant: "destructive"
        });
      }

      // Add options to the room
      if (roomData.options && roomData.options.length > 0) {
        const optionsToInsert = roomData.options.map(option => ({
          room_id: room.id,
          text: option,
          submitted_by: userId
        }));

        const { error: optionsError } = await supabase
          .from('options')
          .insert(optionsToInsert);

        if (optionsError) {
          console.error('Error adding options:', optionsError);
          toast({
            title: "Warning",
            description: "Room created but some options failed to save",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Room created successfully!",
        description: `Room "${roomData.title}" is ready for participants`,
      });

      if (refetchRooms) {
        refetchRooms();
      }

      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Failed to create room",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    }
  };

  const joinRoom = async (roomCode: string, displayName: string): Promise<Room | null> => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to join a room",
        variant: "destructive"
      });
      return null;
    }

    if (!roomCode?.trim()) {
      toast({
        title: "Invalid room code",
        description: "Please enter a valid room code",
        variant: "destructive"
      });
      return null;
    }

    if (!displayName?.trim()) {
      toast({
        title: "Display name required",
        description: "Please enter your display name",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('Attempting to join room with code:', roomCode);

      // First, find the room by code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select(`
          *,
          room_participants (
            id,
            user_id,
            display_name,
            joined_at
          ),
          options!options_room_id_fkey (
            id,
            text,
            submitted_by,
            created_at
          ),
          votes (
            id,
            user_id,
            option_id,
            created_at
          )
        `)
        .eq('code', roomCode.toUpperCase().trim())
        .eq('is_open', true)
        .single();

      if (roomError) {
        console.error('Error finding room:', roomError);
        
        if (roomError.code === 'PGRST116') {
          toast({
            title: "Room not found",
            description: "No room exists with that code, or the room may be closed",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error joining room",
            description: roomError.message,
            variant: "destructive"
          });
        }
        return null;
      }

      if (!room) {
        toast({
          title: "Room not found",
          description: "No room exists with that code, or the room may be closed",
          variant: "destructive"
        });
        return null;
      }

      // Check if room is at capacity
      const currentParticipants = room.room_participants?.length || 0;
      if (room.max_participants && currentParticipants >= room.max_participants) {
        toast({
          title: "Room is full",
          description: `This room has reached its maximum capacity of ${room.max_participants} participants`,
          variant: "destructive"
        });
        return null;
      }

      // Check if user is already in the room
      const isAlreadyParticipant = room.room_participants?.some(
        (participant: any) => participant.user_id === userId
      );

      if (isAlreadyParticipant) {
        toast({
          title: "Already in room",
          description: "You're already a participant in this room",
        });
        
        // Format the room properly and return it
        const formattedRoom = {
          ...room,
          room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
          options: Array.isArray(room.options) ? room.options : [],
          votes: Array.isArray(room.votes) ? room.votes : []
        } as Room;

        return formattedRoom;
      }

      // Add user to room
      const { error: joinError } = await supabase
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: userId,
          display_name: displayName.trim()
        });

      if (joinError) {
        console.error('Error joining room:', joinError);
        toast({
          title: "Failed to join room",
          description: joinError.message,
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Successfully joined room!",
        description: `Welcome to "${room.title}"`,
      });

      if (refetchRooms) {
        refetchRooms();
      }

      // Format the room properly and return it
      const formattedRoom = {
        ...room,
        room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
        options: Array.isArray(room.options) ? room.options : [],
        votes: Array.isArray(room.votes) ? room.votes : []
      } as Room;

      return formattedRoom;
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Failed to join room",
        description: "An unexpected error occurred while joining the room",
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
