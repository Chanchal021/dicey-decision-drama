
import { User as SupabaseUser } from '@supabase/supabase-js';

export type Screen = 
  | "landing" 
  | "login" 
  | "dashboard" 
  | "create-room" 
  | "join-room" 
  | "room-lobby" 
  | "voting" 
  | "results" 
  | "past-decisions";

export interface RoomOption {
  id: string;
  text: string;
  submitted_by: string;
  submitted_at: string;
}

export interface Room {
  id: string;
  title: string;
  description?: string;
  code: string;
  max_participants?: number;
  creator_id: string;
  options: string[]; // Keep for backward compatibility
  room_options?: RoomOption[]; // New detailed options
  is_voting_active: boolean;
  final_choice?: string;
  tiebreaker_used?: 'dice' | 'spinner' | 'coin';
  created_at: string;
  resolved_at?: string;
  participants?: Array<{
    id: string;
    user_id: string;
    display_name: string;
    joined_at: string;
  }>;
  votes?: Array<{
    id: string;
    user_id: string;
    option: string;
    voted_at: string;
  }>;
}

export type User = SupabaseUser;
