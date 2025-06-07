
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRoomsRealtime = (userId?: string, refetchRooms?: () => void) => {
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setupChannel = () => {
    if (!userId || !refetchRooms) return;

    console.log('Setting up real-time subscriptions for user:', userId);

    const channel = supabase
      .channel(`user_rooms_channel_${userId}_${Date.now()}`) // Add timestamp for uniqueness
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' }, 
        (payload) => {
          console.log('Rooms table changed:', payload);
          refetchRooms();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'room_participants' }, 
        (payload) => {
          console.log('Room participants table changed:', payload);
          refetchRooms();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'options' }, 
        (payload) => {
          console.log('Options table changed:', payload);
          refetchRooms();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        (payload) => {
          console.log('Votes table changed:', payload);
          refetchRooms();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
          // Clear any pending reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('Real-time subscription error/timeout/closed:', status);
          // Attempt to reconnect after a delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect rooms subscription...');
            cleanup();
            setupChannel();
          }, 3000);
        }
      });

    channelRef.current = channel;
  };

  const cleanup = () => {
    if (channelRef.current) {
      console.log('Cleaning up real-time subscriptions');
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
  }, [userId, refetchRooms]);
};
