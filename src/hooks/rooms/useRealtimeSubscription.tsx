
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAndFormatRoom } from './useRoomDataFetcher';
import { Room } from './types';

interface UseRealtimeSubscriptionProps {
  roomId: string;
  onRoomUpdate: (room: Room) => void;
}

export const useRealtimeSubscription = ({ roomId, onRoomUpdate }: UseRealtimeSubscriptionProps) => {
  useEffect(() => {
    console.log('Setting up real-time subscription for room:', roomId);

    const handleRoomUpdate = async () => {
      const updatedRoom = await fetchAndFormatRoom(roomId);
      if (updatedRoom) {
        onRoomUpdate(updatedRoom);
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
          await handleRoomUpdate();
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
          await handleRoomUpdate();
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
          await handleRoomUpdate();
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
          await handleRoomUpdate();
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
