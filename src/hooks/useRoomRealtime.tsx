
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types';

interface UseRoomRealtimeProps {
  roomId: string | null;
  onRoomUpdate: (room: Room) => void;
}

export const useRoomRealtime = ({ roomId, onRoomUpdate }: UseRoomRealtimeProps) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Clean up previous subscription
    if (channelRef.current) {
      console.log('Cleaning up previous room subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Only subscribe if we have a roomId
    if (!roomId) {
      console.log('No room ID, skipping subscription');
      return;
    }

    console.log('Setting up real-time subscription for room:', roomId);

    const fetchRoomData = async () => {
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
          console.error('Error fetching room data:', error);
          return;
        }

        if (room) {
          // Ensure all arrays are properly typed and not error objects
          const safeRoom: Room = {
            ...room,
            room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
            options: Array.isArray(room.options) ? room.options : [],
            votes: Array.isArray(room.votes) ? room.votes : []
          };
          
          console.log('Room data updated:', safeRoom);
          onRoomUpdate(safeRoom);
        }
      } catch (error) {
        console.error('Error in fetchRoomData:', error);
      }
    };

    // Set up the channel
    const channel = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, 
        () => {
          console.log('Room table changed');
          fetchRoomData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, 
        () => {
          console.log('Room participants changed');
          fetchRoomData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'options', filter: `room_id=eq.${roomId}` }, 
        () => {
          console.log('Options changed');
          fetchRoomData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` }, 
        () => {
          console.log('Votes changed');
          fetchRoomData();
        }
      )
      .subscribe((status) => {
        console.log('Room subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to room updates');
          // Fetch initial data
          fetchRoomData();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Room subscription error');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up room subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId, onRoomUpdate]);
};
