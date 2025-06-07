
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Room } from './types';

export const useRoomData = (userId?: string) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRooms = async () => {
    if (!userId) {
      setRooms([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      
      // With the new RLS policies, we need to fetch rooms differently
      // First get rooms where user is creator
      const { data: createdRooms, error: createdError } = await supabase
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
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (createdError) {
        console.error('Error fetching created rooms:', createdError);
        throw createdError;
      }

      // Then get rooms where user is participant
      const { data: participantRooms, error: participantError } = await supabase
        .from('room_participants')
        .select(`
          room_id,
          rooms!room_participants_room_id_fkey (
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
          )
        `)
        .eq('user_id', userId);

      if (participantError) {
        console.error('Error fetching participant rooms:', participantError);
        throw participantError;
      }

      // Combine and deduplicate rooms
      const allRooms: Room[] = [];
      const roomIds = new Set<string>();

      // Add created rooms
      if (createdRooms) {
        createdRooms.forEach(room => {
          if (!roomIds.has(room.id)) {
            roomIds.add(room.id);
            allRooms.push({
              ...room,
              room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
              options: Array.isArray(room.options) ? room.options : [],
              votes: Array.isArray(room.votes) ? room.votes : []
            });
          }
        });
      }

      // Add participant rooms (where user is not creator)
      if (participantRooms) {
        participantRooms.forEach(participantRoom => {
          const room = participantRoom.rooms;
          if (room && !roomIds.has(room.id) && room.creator_id !== userId) {
            roomIds.add(room.id);
            allRooms.push({
              ...room,
              room_participants: Array.isArray(room.room_participants) ? room.room_participants : [],
              options: Array.isArray(room.options) ? room.options : [],
              votes: Array.isArray(room.votes) ? room.votes : []
            });
          }
        });
      }

      // Sort by creation date
      allRooms.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRooms(allRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error loading rooms",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [userId]);

  return {
    rooms,
    loading,
    error,
    fetchRooms
  };
};
