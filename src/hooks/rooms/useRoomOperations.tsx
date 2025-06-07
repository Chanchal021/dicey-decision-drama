
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateRoomData, Room } from './types';
import { useProfileManager } from './useProfileManager';

export const useRoomOperations = (userId?: string, refetchRooms?: () => void) => {
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
        // Don't fail completely, just warn
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

      // Step 1: Find the room with detailed debugging
      console.log('🔍 Searching for room in database...');
      
      // First, let's try to get all rooms without filtering to see if RLS is the issue
      console.log('🔍 Checking all rooms visibility...');
      const { data: allRoomsCheck, error: allRoomsError } = await supabase
        .from('rooms')
        .select('code, title, creator_id, is_open')
        .limit(10);
      
      console.log('All rooms check:', { allRoomsCheck, allRoomsError });

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', normalizedCode);

      console.log('📊 Room query details:');
      console.log('  - Query:', `SELECT * FROM rooms WHERE code = '${normalizedCode}'`);
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
        console.log('❌ No room found with code:', normalizedCode);
        console.log('🔍 Let me check what rooms exist...');
        
        // Debug: Check what rooms exist
        const { data: allRooms } = await supabase
          .from('rooms')
          .select('code, title')
          .limit(10);
        
        console.log('🏠 Available rooms (first 10):', allRooms);
        
        toast({
          title: "Room not found",
          description: `No room exists with code "${normalizedCode}"`,
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

      // Step 2: Check if room is open
      if (!room.is_open) {
        console.log('❌ Room is closed');
        toast({
          title: "Room is closed",
          description: "This room is no longer accepting new participants",
          variant: "destructive"
        });
        return null;
      }

      // Step 3: Check current participants
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

      // Step 4: Check capacity
      if (room.max_participants && currentParticipants >= room.max_participants) {
        console.log('❌ Room is at capacity');
        toast({
          title: "Room is full",
          description: `This room has reached its maximum capacity of ${room.max_participants} participants`,
          variant: "destructive"
        });
        return null;
      }

      // Step 5: Check if user is already in room
      const isAlreadyParticipant = participants?.some(p => p.user_id === userId);
      console.log('🔍 User already participant?', isAlreadyParticipant);

      if (isAlreadyParticipant) {
        console.log('ℹ️ User already in room, fetching complete data');
        toast({
          title: "Already in room",
          description: "You're already a participant in this room",
        });
        return await fetchCompleteRoomData(room.id);
      }

      // Step 6: Add user to room
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

      const completeRoom = await fetchCompleteRoomData(room.id);
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

  // Helper function to fetch complete room data
  const fetchCompleteRoomData = async (roomId: string): Promise<Room | null> => {
    console.log('🔄 Fetching complete room data for:', roomId);
    
    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_participants!room_participants_room_id_fkey (
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
          votes!votes_room_id_fkey (
            id,
            user_id,
            option_id,
            created_at
          )
        `)
        .eq('id', roomId)
        .single();

      console.log('📊 Complete room data result:', { room, error });

      if (error) {
        console.error('❌ Error fetching complete room data:', error);
        return null;
      }

      const formattedRoom = {
        ...room,
        room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
        options: Array.isArray(room.options) ? room.options : [],
        votes: Array.isArray(room.votes) ? room.votes : []
      } as Room;

      console.log('✅ Formatted room data:', formattedRoom);
      return formattedRoom;
    } catch (error) {
      console.error('❌ Unexpected error fetching complete room data:', error);
      return null;
    }
  };

  return {
    createRoom,
    joinRoom
  };
};
