import { createClient } from '@supabase/supabase-js';
// import { Channel, User } from './types/supabase';
// Removed import of Database as it does not exist in '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
