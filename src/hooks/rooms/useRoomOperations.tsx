
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
      console.log('Creating room with data:', roomData);
      
      // Generate room code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_room_code');

      if (codeError) {
        console.error('Error generating room code:', codeError);
        throw codeError;
      }

      console.log('Generated room code:', codeData);

      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          title: roomData.title,
          description: roomData.description,
          code: codeData,
          max_participants: roomData.maxParticipants,
          creator_id: userId
        })
        .select()
        .single();

      if (roomError) {
        console.error('Error creating room:', roomError);
        throw roomError;
      }

      console.log('Room created successfully:', room);

      // Get user profile for display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single();

      console.log('User profile:', profile);

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: userId,
          display_name: profile?.display_name || 'You'
        });

      if (participantError) {
        console.error('Error adding creator as participant:', participantError);
        // Don't throw here - room is still created successfully
      }

      // Create options for the room
      if (roomData.options && roomData.options.length > 0) {
        const optionsToInsert = roomData.options.map(option => ({
          room_id: room.id,
          submitted_by: userId,
          text: option
        }));

        const { error: optionsError } = await supabase
          .from('options')
          .insert(optionsToInsert);

        if (optionsError) {
          console.error('Error creating options:', optionsError);
          // Don't throw here - room is still created successfully
        }
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
        description: error.message || 'An unexpected error occurred',
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
      console.log('Joining room with code:', roomCode);
      
      // Find room by code with exact match and ensure it's open
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .eq('is_open', true)
        .maybeSingle();

      if (roomError) {
        console.error('Error searching for room:', roomError);
        throw roomError;
      }

      let room = roomData;

      if (!room) {
        console.error('Room not found with code:', roomCode);
        
        // Also try a case-insensitive search as fallback
        const { data: fallbackRoom, error: fallbackError } = await supabase
          .from('rooms')
          .select('*')
          .ilike('code', roomCode)
          .eq('is_open', true)
          .maybeSingle();

        if (fallbackError) {
          console.error('Error in fallback search:', fallbackError);
        }

        if (!fallbackRoom) {
          toast({
            title: "Room not found 😕",
            description: `No active room found with code "${roomCode}". Please check the code and try again.`,
            variant: "destructive"
          });
          return null;
        }
        
        // Use the fallback room if found
        console.log('Found room via fallback search:', fallbackRoom);
        room = fallbackRoom;
      }

      console.log('Found room:', room);

      // Check if room is full
      const { data: participants, error: participantsError } = await supabase
        .from('room_participants')
        .select('id')
        .eq('room_id', room.id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        throw participantsError;
      }

      console.log('Current participants:', participants);

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
        .from('room_participants')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingParticipant) {
        console.log('Adding user as participant');
        // Add user as participant
        const { error: joinError } = await supabase
          .from('room_participants')
          .insert({
            room_id: room.id,
            user_id: userId,
            display_name: displayName
          });

        if (joinError) {
          console.error('Error joining room:', joinError);
          throw joinError;
        }
      } else {
        console.log('User already in room, updating display name');
        // Update display name if user is already in room
        const { error: updateError } = await supabase
          .from('room_participants')
          .update({ display_name: displayName })
          .eq('room_id', room.id)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating participant:', updateError);
          // Don't throw here - user can still join
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
        description: error.message || 'An unexpected error occurred',
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
