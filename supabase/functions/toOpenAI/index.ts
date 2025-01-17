import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

interface ProfileRecord {
    id: string;
    bio: string;
    updated_at: string;
}

interface EmbeddingRecord {
    user_id: string;
    embedding: number[];
    updated_at: string;
}

interface WebhookPayload {
    type: 'UPDATE' | 'INSERT' | 'DELETE';
    table: string;
    record: ProfileRecord;
    schema: string;
    old_record?: ProfileRecord;
}

serve(async (req) => {
    try {
        const payload: WebhookPayload = await req.json();
        console.log("Received webhook payload:", payload);

        // We only want to process profile bio updates
        if (payload.type !== 'UPDATE' || payload.table !== 'profile' || !payload.record.bio) {
            return new Response(JSON.stringify({ message: 'Skipping: Not a profile bio update' }), { status: 200 });
        }

        const { id, bio } = payload.record;
        //Output the id and bio
        console.log("id: ", id);
        console.log("bio: ", bio);

        // Retrieve environment variables
        const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_KEY');

        //Check if the environment variables are set one by one
        if (!openAiApiKey) {
            console.log("Missing openai api key.");
            return new Response(JSON.stringify({ error: 'Missing required environment variables.' }), { status: 500 });
        }
        if (!supabaseUrl) {
            console.log("Missing supabase url.");
            return new Response(JSON.stringify({ error: 'Missing required environment variables.' }), { status: 500 });
        }
        if (!supabaseKey) {
            console.log("Missing supabase key.");
            return new Response(JSON.stringify({ error: 'Missing required environment variables.' }), { status: 500 });
        }

        // Generate the embedding from OpenAI API
        const openAiResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json',
                'dimensions': '384',
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: bio,
            }),
        });

        if (!openAiResponse.ok) {
            const errorDetails = await openAiResponse.text();
            return new Response(JSON.stringify({ error: 'Error from OpenAI API', details: errorDetails }), { status: 500 });
        }

        console.log("openai response: ", openAiResponse);

        const { data } = await openAiResponse.json();

        if (!data || !data[0] || !data[0].embedding) {
            return new Response(JSON.stringify({ error: 'Invalid response from OpenAI API.' }), { status: 500 });
        }

        const embedding = data[0].embedding;

        // Upsert the embedding into the embeddings table using Supabase
        const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/embeddings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
                user_id: id,
                embedding,
                updated_at: new Date().toISOString()
            }),
        });

        if (!supabaseResponse.ok) {
            const errorDetails = await supabaseResponse.text();
            return new Response(JSON.stringify({ error: 'Error updating Supabase', details: errorDetails }), { status: 500 });
        }

        // Return success response
        return new Response(JSON.stringify({ message: 'Embedding updated successfully.' }), { status: 200 });
    } catch (error: unknown) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(JSON.stringify({ error: 'Unexpected error occurred.', details: errorMessage }), { status: 500 });
    }
});