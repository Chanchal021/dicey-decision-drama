
// Re-export the Room interface from the main types file
export type { Room } from '@/types';

export interface CreateRoomData {
  title: string;
  description?: string;
  options: string[];
  maxParticipants?: number;
}
