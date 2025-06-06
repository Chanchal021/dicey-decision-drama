
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Room } from './types';

export const useRoomData = (userId?: string) => {
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
        .from('room_participants')
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
          room_participants (
            id,
            user_id,
            display_name,
            joined_at
          ),
          options (
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

      // Ensure all joined data is properly formatted as arrays
      const formattedRooms = (data || []).map(room => ({
        ...room,
        room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
        options: Array.isArray(room.options) ? room.options : [],
        votes: Array.isArray(room.votes) ? room.votes : []
      })) as Room[];

      setRooms(formattedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [userId]);

  return {
    rooms,
    loading,
    fetchRooms
  };
};
