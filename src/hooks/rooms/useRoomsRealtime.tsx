
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRoomsRealtime = (userId?: string, refetchRooms?: () => void) => {
  useEffect(() => {
    if (!userId || !refetchRooms) return;

    console.log('Setting up real-time subscriptions for user:', userId);

    const channel = supabase
      .channel('user_rooms_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms' }, 
        (payload) => {
          console.log('Rooms table changed:', payload);
          refetchRooms();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'participants' }, 
        (payload) => {
          console.log('Participants table changed:', payload);
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
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Real-time subscription error');
        }
      });

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [userId, refetchRooms]);
};
