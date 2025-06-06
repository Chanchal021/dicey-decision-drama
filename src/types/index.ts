
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
  created_at: string;
}

export interface Room {
  id: string;
  title: string;
  description?: string;
  code: string;
  max_participants?: number;
  creator_id: string;
  is_open: boolean;
  is_voting_active: boolean;
  final_option_id?: string;
  tiebreaker_used?: 'dice' | 'spinner' | 'coin';
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  // Related data from joins
  room_participants?: Array<{
    id: string;
    user_id: string;
    display_name: string;
    joined_at: string;
  }>;
  options?: Array<{
    id: string;
    text: string;
    submitted_by: string;
    created_at: string;
  }>;
  votes?: Array<{
    id: string;
    user_id: string;
    option_id: string;
    created_at: string;
  }>;
  // Computed properties for backward compatibility
  final_choice?: string;
}

export type User = SupabaseUser;
