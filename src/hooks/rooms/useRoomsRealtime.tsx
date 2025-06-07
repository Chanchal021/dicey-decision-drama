
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRoomsRealtime = (userId?: string, refetchRooms?: () => void) => {
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubscribedRef = useRef(false);

  const setupChannel = useCallback(() => {
    if (!userId || !refetchRooms) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('Setting up real-time subscriptions for user:', userId);

    const channel = supabase
      .channel(`user_rooms_${userId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' }, 
        () => {
          if (isSubscribedRef.current) refetchRooms();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'room_participants' }, 
        () => {
          if (isSubscribedRef.current) refetchRooms();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'options' }, 
        () => {
          if (isSubscribedRef.current) refetchRooms();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        () => {
          if (isSubscribedRef.current) refetchRooms();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          // Clear any pending reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          isSubscribedRef.current = false;
          console.error('Real-time subscription error/timeout/closed:', status);
          // Only attempt reconnect if we still have userId and refetchRooms
          if (userId && refetchRooms && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              setupChannel();
            }, 3000);
          }
        }
      });

    channelRef.current = channel;
  }, [userId, refetchRooms]);

  const cleanup = useCallback(() => {
    isSubscribedRef.current = false;
    if (channelRef.current) {
      console.log('Cleaning up real-time subscriptions');
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
