
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types';

interface UseRoomRealtimeProps {
  roomId: string | null;
  onRoomUpdate: (room: Room) => void;
}

export const useRoomRealtime = ({ roomId, onRoomUpdate }: UseRoomRealtimeProps) => {
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubscribedRef = useRef(false);

  const fetchRoomData = useCallback(async () => {
    if (!roomId || !isSubscribedRef.current) return;
    
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

      if (room && isSubscribedRef.current) {
        const safeRoom: Room = {
          ...room,
          room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
          options: Array.isArray(room.options) ? room.options : [],
          votes: Array.isArray(room.votes) ? room.votes : []
        };
        
        onRoomUpdate(safeRoom);
      }
    } catch (error) {
      console.error('Error in fetchRoomData:', error);
    }
  }, [roomId, onRoomUpdate]);

  const setupChannel = useCallback(() => {
    if (!roomId) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('Setting up real-time subscription for room:', roomId);

    const channel = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, 
        () => fetchRoomData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, 
        () => fetchRoomData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'options', filter: `room_id=eq.${roomId}` }, 
        () => fetchRoomData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` }, 
        () => fetchRoomData()
      )
      .subscribe((status) => {
        console.log('Room subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          // Clear any pending reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
          // Fetch initial data
          fetchRoomData();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          isSubscribedRef.current = false;
          console.error('Room subscription error/timeout/closed:', status);
          // Only attempt reconnect if we still have a roomId
          if (roomId && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              setupChannel();
            }, 2000); // Reduced timeout for faster reconnection
          }
        }
      });

    channelRef.current = channel;
  }, [roomId, fetchRoomData]);

  const cleanup = useCallback(() => {
    isSubscribedRef.current = false;
    if (channelRef.current) {
      console.log('Cleaning up room subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    setupChannel();
    return cleanup;
  }, [setupChannel, cleanup]);
};
