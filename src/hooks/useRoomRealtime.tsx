
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
          
          // Fetch updated room data with all relationships
          const { data: updatedRoom, error } = await supabase
            .from('rooms')
            .select(`
              *,
              participants (
                id,
                user_id,
                display_name,
                joined_at
              ),
              votes (
                id,
                user_id,
                option,
                voted_at
              )
            `)
            .eq('id', roomId)
            .single();

          if (error) {
            console.error('Error fetching updated room:', error);
            return;
          }

          if (updatedRoom) {
            onRoomUpdate(updatedRoom);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          console.log('Participants updated:', payload);
          
          // Fetch updated room data
          const { data: updatedRoom, error } = await supabase
            .from('rooms')
            .select(`
              *,
              participants (
                id,
                user_id,
                display_name,
                joined_at
              ),
              votes (
                id,
                user_id,
                option,
                voted_at
              )
            `)
            .eq('id', roomId)
            .single();

          if (error) {
            console.error('Error fetching updated room:', error);
            return;
          }

          if (updatedRoom) {
            onRoomUpdate(updatedRoom);
          }
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
          
          // Fetch updated room data
          const { data: updatedRoom, error } = await supabase
            .from('rooms')
            .select(`
              *,
              participants (
                id,
                user_id,
                display_name,
                joined_at
              ),
              votes (
                id,
                user_id,
                option,
                voted_at
              )
            `)
            .eq('id', roomId)
            .single();

          if (error) {
            console.error('Error fetching updated room:', error);
            return;
          }

          if (updatedRoom) {
            onRoomUpdate(updatedRoom);
          }
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
