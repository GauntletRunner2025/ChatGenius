import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { BaseFunction } from '../_shared/BaseFunction.ts';

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

class GetEmbeddingFunction extends BaseFunction {
  async handleRequest(req: Request): Promise<Response> {
    const body = await req.json();

    const { text } = body;
    if (!text) {
      console.log('Error: Text is required');
      return this.createErrorResponse('Text is required', 400);
    }

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      console.log('Error: OpenAI API key not configured');
      return this.createErrorResponse('OpenAI API key not configured', 500);
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 384
      })
    });

    if (!openAiResponse.ok) {
      const error = await openAiResponse.text();
      console.log('OpenAI API error:', error);
      return this.createErrorResponse(`OpenAI API error: ${error}`, 500);
    }

    const responseData = await openAiResponse.json();
    const typedResponse = responseData as OpenAIEmbeddingResponse;
    if (!typedResponse.data?.[0]?.embedding) {
      console.log('Error: Invalid response structure from OpenAI');
      return this.createErrorResponse('Invalid response from OpenAI API', 500);
    }

    const embedding = typedResponse.data[0].embedding;

    // Store the search query and embedding
    const { error: insertError } = await this.supabaseClient
      .from('searches')
      .insert({
        user_id: this.user.id,
        query: text,
        query_embedding: embedding,
        status: 'pending'  // Client will update this to 'completed' with results
      });

    if (insertError) {
      console.log('Error inserting search:', insertError);
      return this.createErrorResponse('Failed to store search', 500);
    }

    return this.createResponse({ 
      embedding,
      searchId: this.user.id
    });
  }
}

const handler = new GetEmbeddingFunction();
serve((req) => handler.serve(req)); 