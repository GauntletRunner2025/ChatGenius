import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Helper function for consistent response formatting
function createResponse(body: Record<string, any>, status: number) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

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
            return createResponse({ message: 'Skipping: Not a profile bio update' }, 200);
        }

        const { id, bio } = payload.record;
        console.log("id: ", id);
        console.log("bio: ", bio);

        // Retrieve environment variables
        const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        //Check if the environment variables are set one by one
        if (!openAiApiKey) {
            console.log("Missing openai api key.");
            return createResponse({ error: 'Missing OpenAI API key' }, 500);
        }
        else{
            //Log the length and first 10 characters of the api key
            console.log("OpenAI API key length: ", openAiApiKey.length);
            console.log("OpenAI API key first 10 characters: ", openAiApiKey.substring(0, 10));
        }
        if (!supabaseUrl) {
            console.log("Missing supabase url.");
            return createResponse({ error: 'Missing Supabase URL' }, 500);
        }
        if (!supabaseKey) {
            console.log("Missing supabase key.");
            return createResponse({ error: 'Missing Supabase key' }, 500);
        }

        // Generate the embedding from OpenAI API
        const openAiResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: bio,
                dimensions: 384
            }),
        });

        if (!openAiResponse.ok) {
            const errorDetails = await openAiResponse.text();
            console.log("OpenAI API error:", errorDetails);
            return createResponse({ error: 'Error from OpenAI API', details: errorDetails }, 500);
        }

        const { data } = await openAiResponse.json();

        if (!data || !data[0] || !data[0].embedding) {
            return createResponse({ error: 'Invalid response from OpenAI API' }, 500);
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
            console.log("Supabase error:", errorDetails);
            return createResponse({ error: 'Error updating Supabase', details: errorDetails }, 500);
        }

        // Return success response
        return createResponse({ message: 'Embedding updated successfully' }, 200);
    } catch (error: unknown) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.log("Unexpected error:", errorMessage);
        return createResponse({ error: 'Unexpected error occurred', details: errorMessage }, 500);
    }
});