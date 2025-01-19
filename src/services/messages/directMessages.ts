import { supabase } from '../../supabase';
import { DirectMessage } from './types';

export const fetchDirectMessages = async (userId: string): Promise<DirectMessage[]> => {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`sender.eq.${userId},receiver.eq.${userId}`)
    .order('inserted_at', { ascending: true });

  if (error) {
    console.error('Error fetching direct messages:', error);
    return [];
  }

  return data as DirectMessage[];
};

export const sendDirectMessage = async (
  sender: string, 
  receiver: string, 
  message: string
): Promise<DirectMessage | null> => {
  const { data, error } = await supabase
    .from('direct_messages')
    .insert([{ sender, receiver, message }])
    .select()
    .single();

  if (error) {
    console.error('Error sending direct message:', error);
    return null;
  }

  return data as DirectMessage;
}; 