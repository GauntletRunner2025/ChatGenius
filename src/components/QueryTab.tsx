import { useState, KeyboardEvent, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import { useMessageEmbeddings } from '../hooks/useMessageEmbeddings';
import { cosineSimilarity } from '../utils/similarity';

interface SimilarMessage {
    message: string;
    similarity: number;
}

export function QueryTab() {
    const [query, setQuery] = useState('');
    const { user } = useAuth();
    const [lastQueryId, setLastQueryId] = useState<number | null>(null);
    const messageEmbeddings = useMessageEmbeddings();
    const [similarMessages, setSimilarMessages] = useState<SimilarMessage[]>([]);

    useEffect(() => {
        // Subscribe to realtime updates on the query table
        const subscription = supabase
            .channel('query_updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'query',
                    filter: lastQueryId ? `id=eq.${lastQueryId}` : undefined
                },
                (payload) => {
                    if (payload.new.embedding) {
                        console.log('Embedding received for query:', payload.new.text);
                        
                        // Calculate similarities with all message embeddings
                        const similarities = messageEmbeddings
                            .map(msg => ({
                                message: msg.message,
                                similarity: cosineSimilarity(payload.new.embedding, msg.embedding)
                            }))
                            .sort((a, b) => b.similarity - a.similarity)
                            .slice(0, 5); // Get top 5 similar messages

                        setSimilarMessages(similarities);
                        console.log('Most similar messages:', similarities);
                        setLastQueryId(null); // Reset after receiving embedding
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [lastQueryId, messageEmbeddings]);

    const handleSubmitQuery = async (text: string) => {
        if (!user) {
            console.error('User must be logged in to submit queries');
            return;
        }

        const { data, error } = await supabase
            .from('query')
            .insert([
                {
                    text,
                    user_id: user.id,
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error submitting query:', error);
        } else {
            console.log('Query submitted:', text);
            setLastQueryId(data.id);
            setSimilarMessages([]); // Clear previous results
        }
    };

    const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            await handleSubmitQuery(query);
            setQuery('');
        }
    };

    return (
        <div className="p-4 space-y-4">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your query..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            
            {similarMessages.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">Similar Messages:</h3>
                    <div className="space-y-2">
                        {similarMessages.map((sim, index) => (
                            <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                                <div className="text-gray-800">{sim.message}</div>
                                <div className="text-sm text-gray-500">
                                    Similarity: {(sim.similarity * 100).toFixed(1)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 