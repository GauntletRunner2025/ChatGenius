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

interface Messages {
  id: string
  message: string
  embedding?: number[]
}

class MessagesInsertFunction extends BaseFunction {
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
    
    const payload = await req.json() as WebhookPayload<Messages>
    this.debug(`Received webhook payload type: ${payload.type}`);
    this.debug(`Received webhook table: ${payload.table}`);
    this.debug(`Received webhook schema: ${payload.schema}`);
    this.debug(`Received message: ${JSON.stringify(payload.record)}`);
    
    if (!payload.record?.message) {
      this.debug('Messages text is missing');
      return this.createErrorResponse('Messages text is required', 400)
    }

    // Call getEmbedding function
    const embedUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/get-embedding`;
    this.debug(`Calling getEmbedding function at: ${embedUrl}`);
    this.debug(`Messages text to embed: ${payload.record.message}`);

    const embeddingResponse = await fetch(embedUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: payload.record.message
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

    // Update message with embedding
    this.debug(`Updating message ${payload.record.id} with embedding`);
    const { data, error } = await this.supabaseClient
      .from('messages')
      .update({ embedding })
      .eq('id', payload.record.id)
      .select()
      .single();

    if (error) {
      this.debug(`Failed to update messages: ${JSON.stringify(error)}`);
      return this.createErrorResponse('Failed to store embedding', 500)
    }

    this.debug('Successfully updated messages with embedding');
    return this.createResponse({ success: true })
  }
}

const handler = new MessagesInsertFunction();
serve((req: Request) => handler.serve(req));