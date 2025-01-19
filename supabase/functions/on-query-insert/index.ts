// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { WebhookPayload } from '../_shared/types/Webhook.ts'
import { BaseFunction } from '../_shared/BaseFunction.ts'

console.log("Hello from Functions!")

interface Query {
  id: string
  text: string
  embedding?: number[]
}

class QueryInsertFunction extends BaseFunction {
  // Override serve to bypass authentication
  public override async serve(req: Request): Promise<Response> {
    try {
      // Handle CORS
      const corsResponse = await this.handleCors(req);
      if (corsResponse) return corsResponse;

      // Handle the actual request
      return await this.handleRequest(req);

    } catch (error: unknown) {
      console.error('Error in function:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return this.createErrorResponse(errorMessage);
    }
  }

  async handleRequest(req: Request): Promise<Response> {
    this.debug('Starting handleRequest');
    
    const payload = await req.json() as WebhookPayload<Query>
    this.debug(`Received webhook payload type: ${payload.type}`);
    this.debug(`Received webhook table: ${payload.table}`);
    this.debug(`Received webhook schema: ${payload.schema}`);
    this.debug(`Received query: ${JSON.stringify(payload.record)}`);
    
    if (!payload.record?.text) {
      this.debug('Query text is missing');
      return this.createErrorResponse('Query text is required', 400)
    }

    // Call getEmbedding function
    const embedUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/get-embedding`;
    this.debug(`Calling getEmbedding function at: ${embedUrl}`);
    this.debug(`Query text to embed: ${payload.record.text}`);

    const embeddingResponse = await fetch(embedUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: payload.record.text
      })
    })

    this.debug(`Embedding response status: ${embeddingResponse.status}`);
    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      this.debug(`Failed to get embedding: ${errorText}`);
      this.debug(`Response headers: ${JSON.stringify(Object.fromEntries(embeddingResponse.headers.entries()))}`);
      return this.createErrorResponse('Failed to generate embedding', 500)
    }

    const responseData = await embeddingResponse.json();
    this.debug(`Embedding response data: ${JSON.stringify(responseData)}`);
    const { embedding } = responseData;
    this.debug(`Got embedding of length: ${embedding.length}`);

    // Update query with embedding
    this.debug(`Updating query ${payload.record.id} with embedding`);
    const { data, error } = await this.supabaseClient
      .from('query')
      .update({ embedding })
      .eq('id', payload.record.id)
      .select()
      .single();

    if (error) {
      this.debug(`Failed to update query: ${JSON.stringify(error)}`);
      return this.createErrorResponse('Failed to store embedding', 500)
    }

    this.debug('Successfully updated query with embedding');
    return this.createResponse({ success: true })
  }
}

const handler = new QueryInsertFunction();
serve((req: Request) => handler.serve(req));

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/on-query-insert' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
