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
      // Generate a room code using the database function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_room_code');

      if (codeError || !codeData) {
        console.error('Error generating room code:', codeError);
        toast({
          title: "Failed to generate room code",
          description: codeError?.message || "Unable to generate room code",
          variant: "destructive"
        });
        return null;
      }

      // Create the room with the generated code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          title: roomData.title,
          description: roomData.description,
          creator_id: userId,
          max_participants: roomData.maxParticipants,
          code: codeData
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
      console.log('Join room failed: No user ID');
      toast({
        title: "Authentication required",
        description: "You must be logged in to join a room",
        variant: "destructive"
      });
      return null;
    }

    if (!roomCode?.trim()) {
      console.log('Join room failed: No room code');
      toast({
        title: "Invalid room code",
        description: "Please enter a valid room code",
        variant: "destructive"
      });
      return null;
    }

    if (!displayName?.trim()) {
      console.log('Join room failed: No display name');
      toast({
        title: "Display name required",
        description: "Please enter your display name",
        variant: "destructive"
      });
      return null;
    }

    try {
      const normalizedCode = roomCode.toUpperCase().trim();
      console.log('Attempting to join room with code:', normalizedCode);

      // First, find the room by code - simplified query
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', normalizedCode)
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
        console.log('No room found with code:', normalizedCode);
        toast({
          title: "Room not found",
          description: "No room exists with that code, or the room may be closed",
          variant: "destructive"
        });
        return null;
      }

      console.log('Room found:', room);

      // Check current participants count
      const { data: participants, error: participantsError } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', room.id);

      if (participantsError) {
        console.error('Error checking participants:', participantsError);
        toast({
          title: "Error joining room",
          description: "Could not verify room capacity",
          variant: "destructive"
        });
        return null;
      }

      // Check if room is at capacity
      const currentParticipants = participants?.length || 0;
      if (room.max_participants && currentParticipants >= room.max_participants) {
        console.log('Room is full:', currentParticipants, 'of', room.max_participants);
        toast({
          title: "Room is full",
          description: `This room has reached its maximum capacity of ${room.max_participants} participants`,
          variant: "destructive"
        });
        return null;
      }

      // Check if user is already in the room
      const isAlreadyParticipant = participants?.some(
        (participant: any) => participant.user_id === userId
      );

      if (isAlreadyParticipant) {
        console.log('User already in room');
        toast({
          title: "Already in room",
          description: "You're already a participant in this room",
        });
        
        // Fetch complete room data and return it
        return await fetchCompleteRoomData(room.id);
      }

      // Add user to room
      console.log('Adding user to room:', room.id, userId, displayName.trim());
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

      console.log('Successfully joined room');
      toast({
        title: "Successfully joined room!",
        description: `Welcome to "${room.title}"`,
      });

      if (refetchRooms) {
        refetchRooms();
      }

      // Fetch complete room data and return it
      return await fetchCompleteRoomData(room.id);
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

  // Helper function to fetch complete room data
  const fetchCompleteRoomData = async (roomId: string): Promise<Room | null> => {
    try {
      const { data: room, error } = await supabase
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
        .eq('id', roomId)
        .single();

      if (error) {
        console.error('Error fetching complete room data:', error);
        return null;
      }

      // Format the room properly
      const formattedRoom = {
        ...room,
        room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
        options: Array.isArray(room.options) ? room.options : [],
        votes: Array.isArray(room.votes) ? room.votes : []
      } as Room;

      return formattedRoom;
    } catch (error) {
      console.error('Error fetching complete room data:', error);
      return null;
    }
  };

  return {
    createRoom,
    joinRoom
  };
};
