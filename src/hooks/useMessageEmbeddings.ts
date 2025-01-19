import { Message, useEffect, useState, supabase } from '../imports/hooks/message-embeddings.imports';

export function useMessageEmbeddings() {
    const [messageEmbeddings, setMessageEmbeddings] = useState<Message[]>([]);

    useEffect(() => {
        // Load existing embeddings
        const loadEmbeddings = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('id, message, embedding')
                .order('id', { ascending: false });

            if (error) {
                console.error('Error loading embeddings:', error);
                return;
            }

            setMessageEmbeddings(data);
        };

        loadEmbeddings();

        // Subscribe to new embeddings
        const subscription = supabase
            .channel('message_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages'
                },
                async (payload) => {
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        // Fetch the complete message data for the new embedding
                        const { data, error } = await supabase
                            .from('messages')
                            .select('id, message, embedding')
                            .eq('id', payload.new.id)
                            .single();

                        if (!error && data) {
                            setMessageEmbeddings(prev => {
                                const filtered = prev.filter(e => e.id !== data.id);
                                return [data, ...filtered];
                            });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return messageEmbeddings;
} 