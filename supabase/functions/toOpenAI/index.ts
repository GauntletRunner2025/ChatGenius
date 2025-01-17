import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
    // Early return with Hello World
    return new Response(JSON.stringify({ message: 'Hello World' }), { 
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    /* Original implementation kept for reference
    try {
        // Parse the incoming request body
        console.log(req);
        const { id, bio } = await req.json(); // Expecting id and bio
        console.log(id, bio);

        if (!id || !bio) {
            return new Response(JSON.stringify({ error: 'id and bio are required.' }), { status: 400 });
        }

        // Retrieve environment variables
        const openAiApiKey = Deno.env.get('OPENAI_API_KEY'); // OpenAI API key
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_KEY');

        if (!openAiApiKey || !supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ error: 'Missing required environment variables.' }), { status: 500 });
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
            }),
        });

        if (!openAiResponse.ok) {
            const errorDetails = await openAiResponse.text();
            return new Response(JSON.stringify({ error: 'Error from OpenAI API', details: errorDetails }), { status: 500 });
        }

        const { data } = await openAiResponse.json();

        if (!data || !data[0] || !data[0].embedding) {
            return new Response(JSON.stringify({ error: 'Invalid response from OpenAI API.' }), { status: 500 });
        }

        const embedding = data[0].embedding;

        // Save the embedding into the profiles table using Supabase
        const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
                embedding,
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
    */
});