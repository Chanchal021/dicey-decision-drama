
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRoomsRealtime = (userId?: string, refetchRooms?: () => void) => {
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubscribedRef = useRef(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const setupChannel = useCallback(() => {
    if (!userId || !refetchRooms) return;
    
    // Prevent multiple subscriptions
    if (channelRef.current && isSubscribedRef.current) {
      return;
    }

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('Setting up real-time subscriptions for user:', userId);

    const channel = supabase
      .channel(`user_rooms_${userId}_${Date.now()}`, {
        config: {
          broadcast: { self: false },
          presence: { key: userId }
        }
      })
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' }, 
        (payload) => {
          console.log('Rooms table change:', payload);
          if (isSubscribedRef.current) {
            setTimeout(() => refetchRooms(), 100);
          }
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'room_participants' }, 
        (payload) => {
          console.log('Room participants change:', payload);
          if (isSubscribedRef.current) {
            setTimeout(() => refetchRooms(), 100);
          }
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'options' }, 
        (payload) => {
          console.log('Options change:', payload);
          if (isSubscribedRef.current) {
            setTimeout(() => refetchRooms(), 100);
          }
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        (payload) => {
          console.log('Votes change:', payload);
          if (isSubscribedRef.current) {
            setTimeout(() => refetchRooms(), 100);
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          reconnectAttempts.current = 0;
          // Clear any pending reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          isSubscribedRef.current = false;
          console.error('Real-time subscription error/timeout/closed:', status);
          
          // Only attempt reconnect if we haven't exceeded max attempts
          if (userId && refetchRooms && !reconnectTimeoutRef.current && reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current += 1;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff, max 30s
            console.log(`Attempting reconnect ${reconnectAttempts.current}/${maxReconnectAttempts} in ${delay}ms`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              setupChannel();
            }, delay);
          }
        }
      });

    channelRef.current = channel;
  }, [userId, refetchRooms]);

  const cleanup = useCallback(() => {
    isSubscribedRef.current = false;
    reconnectAttempts.current = 0;
    
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);
};
