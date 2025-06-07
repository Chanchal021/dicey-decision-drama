
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types';

interface UseRoomRealtimeProps {
  roomId: string | null;
  onRoomUpdate: (room: Room) => void;
}

export const useRoomRealtime = ({ roomId, onRoomUpdate }: UseRoomRealtimeProps) => {
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRoomData = async () => {
    if (!roomId) return;
    
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

      if (error) {
        console.error('Error fetching room data:', error);
        return;
      }

      if (room) {
        const safeRoom: Room = {
          ...room,
          room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
          options: Array.isArray(room.options) ? room.options : [],
          votes: Array.isArray(room.votes) ? room.votes : []
        };
        
        console.log('Room data updated via real-time:', safeRoom);
        onRoomUpdate(safeRoom);
      }
    } catch (error) {
      console.error('Error in fetchRoomData:', error);
    }
  };

  const setupChannel = () => {
    if (!roomId) {
      console.log('No room ID, skipping subscription');
      return;
    }

    console.log('Setting up real-time subscription for room:', roomId);

    const channel = supabase
      .channel(`room_${roomId}_${Date.now()}`) // Add timestamp for uniqueness
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, 
        (payload) => {
          console.log('Room table changed:', payload);
          fetchRoomData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, 
        (payload) => {
          console.log('Room participants changed:', payload);
          fetchRoomData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'options', filter: `room_id=eq.${roomId}` }, 
        (payload) => {
          console.log('Options changed:', payload);
          fetchRoomData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` }, 
        (payload) => {
          console.log('Votes changed:', payload);
          fetchRoomData();
        }
      )
      .subscribe((status) => {
        console.log('Room subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to room updates');
          // Clear any pending reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
          // Fetch initial data
          fetchRoomData();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('Room subscription error/timeout/closed:', status);
          // Attempt to reconnect after a delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            cleanup();
            setupChannel();
          }, 3000);
        }
      });

    channelRef.current = channel;
  };

  const cleanup = () => {
    if (channelRef.current) {
      console.log('Cleaning up room subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    // Clean up previous subscription
    cleanup();
    
    // Set up new subscription
    setupChannel();

    return cleanup;
  }, [roomId, onRoomUpdate]);
};
