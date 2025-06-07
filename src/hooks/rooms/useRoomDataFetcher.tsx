
import { supabase } from '@/integrations/supabase/client';
import { Room } from './types';

export const fetchAndFormatRoom = async (roomId: string): Promise<Room | null> => {
  const { data: updatedRoom, error } = await supabase
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
    console.error('Error fetching updated room:', error);
    return null;
  }

  if (updatedRoom) {
    // Ensure all joined data is properly formatted as arrays
    const formattedRoom = {
      ...updatedRoom,
      room_participants: Array.isArray(updatedRoom.room_participants) ? updatedRoom.room_participants : [],
      options: Array.isArray(updatedRoom.options) ? updatedRoom.options : [],
      votes: Array.isArray(updatedRoom.votes) ? updatedRoom.votes : []
    } as Room;

    return formattedRoom;
  }

  return null;
};
