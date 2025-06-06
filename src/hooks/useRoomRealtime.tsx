
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Room } from './rooms/types';

interface UseRoomRealtimeProps {
  roomId: string | null;
  onRoomUpdate: (room: Room) => void;
}

export const useRoomRealtime = ({ roomId, onRoomUpdate }: UseRoomRealtimeProps) => {
  useEffect(() => {
    if (!roomId) return;

    console.log('Setting up real-time subscription for room:', roomId);

    const fetchAndFormatRoom = async () => {
      const { data: updatedRoom, error } = await supabase
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
        .eq('id', roomId)
        .single();

      if (error) {
        console.error('Error fetching updated room:', error);
        return;
      }

      if (updatedRoom) {
        // Ensure all joined data is properly formatted as arrays
        const formattedRoom = {
          ...updatedRoom,
          room_participants: Array.isArray(updatedRoom.room_participants) ? updatedRoom.room_participants : [],
          options: Array.isArray(updatedRoom.options) ? updatedRoom.options : [],
          votes: Array.isArray(updatedRoom.votes) ? updatedRoom.votes : []
        } as Room;

        onRoomUpdate(formattedRoom);
      }
    };

    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`
        },
        async (payload) => {
          console.log('Room updated:', payload);
          await fetchAndFormatRoom();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          console.log('Room participants updated:', payload);
          await fetchAndFormatRoom();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'options',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          console.log('Options updated:', payload);
          await fetchAndFormatRoom();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          console.log('Votes updated:', payload);
          await fetchAndFormatRoom();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription for room:', roomId);
      supabase.removeChannel(channel);
    };
  }, [roomId, onRoomUpdate]);
};
