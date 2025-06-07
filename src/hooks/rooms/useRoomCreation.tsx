
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateRoomData, Room } from './types';
import { useProfileManager } from './useProfileManager';

export const useRoomCreation = (userId?: string, refetchRooms?: () => void) => {
  const { toast } = useToast();
  const { ensureUserProfile } = useProfileManager();

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
      console.log('=== ROOM CREATION START ===');
      console.log('User ID:', userId);
      console.log('Room data:', roomData);

      // Ensure the user profile exists
      const profileReady = await ensureUserProfile(userId);
      if (!profileReady) {
        console.log('❌ Profile creation failed');
        return null;
      }

      // Generate a room code using the database function
      console.log('🎲 Generating room code...');
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_room_code');

      console.log('Room code generation result:', { codeData, codeError });

      if (codeError || !codeData) {
        console.error('Error generating room code:', codeError);
        toast({
          title: "Failed to generate room code",
          description: codeError?.message || "Unable to generate room code",
          variant: "destructive"
        });
        return null;
      }

      console.log('✅ Generated room code:', codeData);

      // Create the room with the generated code
      console.log('🏠 Creating room in database...');
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

      console.log('Room creation result:', { room, roomError });

      if (roomError) {
        console.error('Error creating room:', roomError);
        toast({
          title: "Failed to create room",
          description: roomError.message,
          variant: "destructive"
        });
        return null;
      }

      console.log('✅ Room created successfully:', room);

      // Add creator as first participant
      console.log('👤 Adding creator as participant...');
      const { error: participantError } = await supabase
        .from('room_participants')
        .insert({
          room_id: room.id,
          user_id: userId,
          display_name: roomData.title // Use room title as creator's display name for now
        });

      console.log('Participant addition result:', { participantError });

      if (participantError) {
        console.error('Error adding creator as participant:', participantError);
        toast({
          title: "Warning",
          description: "Room created but failed to add you as participant",
          variant: "destructive"
        });
      } else {
        console.log('✅ Creator added as participant');
      }

      // Add options to the room
      if (roomData.options && roomData.options.length > 0) {
        console.log('📝 Adding options to room...');
        const optionsToInsert = roomData.options.map(option => ({
          room_id: room.id,
          text: option,
          submitted_by: userId
        }));

        const { error: optionsError } = await supabase
          .from('options')
          .insert(optionsToInsert);

        console.log('Options addition result:', { optionsError });

        if (optionsError) {
          console.error('Error adding options:', optionsError);
          toast({
            title: "Warning",
            description: "Room created but some options failed to save",
            variant: "destructive"
          });
        } else {
          console.log('✅ Options added successfully');
        }
      }

      toast({
        title: "Room created successfully!",
        description: `Room "${roomData.title}" is ready for participants`,
      });

      if (refetchRooms) {
        refetchRooms();
      }

      console.log('=== ROOM CREATION END ===');
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

  return { createRoom };
};
