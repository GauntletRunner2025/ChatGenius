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

interface OpenAIEmbeddingResponse {
    object: string;
    data: Array<{
        object: string;
        index: number;
        embedding: number[];
    }>;
    model: string;
    usage: {
        prompt_tokens: number;
        total_tokens: number;
    };
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
                'Content-Type': 'application/json'
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

        console.log("OpenAI response status:", openAiResponse.status);
        const responseData = await openAiResponse.json();
        console.log("OpenAI raw response:", responseData);

        const typedResponse = responseData as OpenAIEmbeddingResponse;
        
        if (!typedResponse.data?.[0]?.embedding) {
            console.log("Invalid OpenAI response structure:", typedResponse);
            return createResponse({ 
                error: 'Invalid response from OpenAI API',
                details: 'Response missing expected embedding data structure'
            }, 500);
        }

        const embedding = typedResponse.data[0].embedding;
        console.log("Embedding array length:", embedding.length);

        // Upsert the embedding into the embeddings table using Supabase
        const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/embeddings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
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