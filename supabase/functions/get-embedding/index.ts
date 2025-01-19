import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { BaseFunction } from '../_shared/BaseFunction.ts';

// Add Deno types
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

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

interface RequestBody {
  text: string;
}

class GetEmbeddingFunction extends BaseFunction {
  // Override serve to bypass authentication
  public async serve(req: Request): Promise<Response> {
    try {
      // Handle CORS
      const corsResponse = await this.handleCors(req);
      if (corsResponse) return corsResponse;

      // Check if this is an internal call from another edge function
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        // Allow calls with service role key or anon key
        const isInternalCall = token === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 
                             token === Deno.env.get('SUPABASE_ANON_KEY');
        if (!isInternalCall) {
          return this.createErrorResponse('Unauthorized', 401);
        }
      }

      return await this.handleRequest(req);
    } catch (error: any) {
      console.error('Error:', error.message);
      return this.createErrorResponse(error.message);
    }
  }

  async handleRequest(req: Request): Promise<Response> {
    const body = await req.json() as RequestBody;

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

    //log the openai api key
    console.log('OpenAI API key:', openAiApiKey);

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
    return this.createResponse({ embedding });
  }
}

const handler = new GetEmbeddingFunction();
serve((req: Request) => handler.serve(req)); 