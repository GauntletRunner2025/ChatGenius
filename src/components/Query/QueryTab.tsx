import React, { useState, KeyboardEvent, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';

export function QueryTab() {
    const [query, setQuery] = useState('');
    const { user } = useAuth();
    const [lastQueryId, setLastQueryId] = useState<number | null>(null);

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
                        console.log('Embedding:', payload.new.embedding);
                        setLastQueryId(null); // Reset after receiving embedding
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [lastQueryId]);

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
            setLastQueryId(data.id); // Store the ID to watch for its embedding
        }
    };

    const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            await handleSubmitQuery(query);
            setQuery('');
        }
    };

    return (
        <div className="p-4">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your query..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
        </div>
    );
} 