import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { OpenAIEmbeddingResponse } from '../_shared/types/OpenAI.ts';
import { ProfileRecord } from '../_shared/types/Profile.ts';
import { WebhookPayload } from '../_shared/types/Webhook.ts';
import { EmbeddingRecord } from '../_shared/types/Embedding.ts';
import { BaseFunction } from '../_shared/BaseFunction.ts';

// Helper function for consistent response formatting
function createResponse(body: Record<string, any>, status: number) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

serve(async (req) => {
    try {
        const payload: WebhookPayload<ProfileRecord> = await req.json();
        console.log("Received webhook payload:", payload);

        // We only want to process profile bio updates
        if (payload.type !== 'UPDATE' || payload.table !== 'profile' || !payload.record.bio) {
            return createResponse({ message: 'Skipping: Not a profile bio update' }, 200);
        }

        const { id, bio } = payload.record;
        console.log("id: ", id);
        console.log("bio: ", bio);

        try {
            // Retrieve environment variables
            const openAiApiKey = BaseFunction.getRequiredEnvVar('OPENAI_API_KEY');
            const supabaseUrl = BaseFunction.getRequiredEnvVar('SUPABASE_URL');
            const supabaseKey = BaseFunction.getRequiredEnvVar('SUPABASE_SERVICE_ROLE_KEY');

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
    } catch (error: unknown) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.log("Unexpected error:", errorMessage);
        return createResponse({ error: 'Unexpected error occurred', details: errorMessage }, 500);
    }
});