import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Story = {
  id: string;
  invite_code: string;
  created_by: string;
  player1_id: string;
  player2_id: string | null;
  turn_user_id: string;
  status: 'active' | 'ended';
  created_at: string;
};

export type SentenceRow = {
  id: string;
  story_id: string;
  author_user_id: string;
  sentence: string;
  order_index: number;
  created_at: string;
};
