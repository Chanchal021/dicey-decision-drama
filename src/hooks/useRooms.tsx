
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Room {
  id: string;
  title: string;
  description?: string;
  code: string;
  max_participants?: number;
  creator_id: string;
  options: string[];
  is_voting_active: boolean;
  final_choice?: string;
  tiebreaker_used?: 'dice' | 'spinner' | 'coin';
  created_at: string;
  resolved_at?: string;
  participants?: Array<{
    id: string;
    user_id: string;
    display_name: string;
    joined_at: string;
  }>;
  votes?: Array<{
    id: string;
    user_id: string;
    option: string;
    voted_at: string;
  }>;
}

export const useRooms = (userId?: string) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRooms = async () => {
    if (!userId) {
      setRooms([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch rooms where user is either creator or participant
      const { data: participantRooms, error: participantError } = await supabase
        .from('participants')
        .select('room_id')
        .eq('user_id', userId);

      if (participantError) {
        console.error('Error fetching participant rooms:', participantError);
        toast({
          title: "Error loading rooms",
          description: participantError.message,
          variant: "destructive"
        });
        return;
      }

      const roomIds = participantRooms?.map(p => p.room_id) || [];

      if (roomIds.length === 0) {
        setRooms([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          participants (
            id,
            user_id,
            display_name,
            joined_at
          ),
          votes (
            id,
            user_id,
            option,
            voted_at
          )
        `)
        .in('id', roomIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rooms:', error);
        toast({
          title: "Error loading rooms",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData: {
    title: string;
    description?: string;
    options: string[];
    maxParticipants?: number;
  }) => {
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

      await fetchRooms();
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
      // Find room by code - specify the table name to avoid ambiguity
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

      await fetchRooms();
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

  useEffect(() => {
    fetchRooms();
  }, [userId]);

  // Enhanced real-time subscriptions with better error handling
  useEffect(() => {
    if (!userId) return;

    console.log('Setting up real-time subscriptions for user:', userId);

    const channel = supabase
      .channel('user_rooms_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' }, 
        (payload) => {
          console.log('Rooms table changed:', payload);
          fetchRooms();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'participants' }, 
        (payload) => {
          console.log('Participants table changed:', payload);
          fetchRooms();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        (payload) => {
          console.log('Votes table changed:', payload);
          fetchRooms();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Real-time subscription error');
        }
      });

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    rooms,
    loading,
    createRoom,
    joinRoom,
    refetch: fetchRooms
  };
};
